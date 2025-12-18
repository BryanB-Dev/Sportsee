/**
 * Utilitaires pour formater les données utilisateur pour le chatbot IA
 * Respecte la confidentialité en ne transmettant que les données pertinentes
 */

/**
 * Formate les données d'activité récentes pour l'IA
 * @param {Array} activities - Tableau des activités de l'utilisateur
 * @param {number} limit - Nombre maximum d'activités à inclure (défaut: 10)
 * @returns {string} Texte formaté des activités
 */
export function formatRecentActivities(activities, limit = 10) {
  if (!activities || activities.length === 0) {
    return "Aucune donnée d'activité disponible.";
  }

  // Filtrer les activités pour ne garder que celles avec une date passée ou actuelle
  // NOTE: Pour les données mockées avec dates futures, on garde toutes les activités
  const currentDate = new Date();
  const validActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    // Pour le développement, accepter les dates futures (mock data 2025)
    return activityDate <= currentDate || activity.date.startsWith('2025');
  });

  if (validActivities.length === 0) {
    return "Aucune donnée d'activité passée disponible.";
  }

  const recentActivities = validActivities.slice(-limit);
  const formattedActivities = recentActivities.map(activity => {
    return `${activity.date}: ${activity.distance}km, ${activity.duration}min, ${activity.heartRate?.average || activity.heartRate} BPM`;
  }).join('\n');

  return `Activités récentes:\n${formattedActivities}`;
}

/**
 * Formate le profil utilisateur pour l'IA
 * @param {Object} user - Objet utilisateur
 * @param {Object} statistics - Statistiques utilisateur
 * @returns {string} Texte formaté du profil
 */
export function formatUserProfile(user, statistics) {
  if (!user) {
    return "Profil utilisateur non disponible.";
  }

  const parts = [];
  
  // Date actuelle
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  parts.push(`Date actuelle: ${currentDate}`);
  
  // Informations de base (sans données sensibles)
  if (user.firstName) {
    parts.push(`Prénom: ${user.firstName}`);
  }
  
  // Statistiques si disponibles
  if (statistics) {
    if (statistics.calorieCount) {
      parts.push(`Calories brûlées: ${statistics.calorieCount} kcal`);
    }
    if (statistics.proteinCount) {
      parts.push(`Protéines: ${statistics.proteinCount}g`);
    }
    if (statistics.carbohydrateCount) {
      parts.push(`Glucides: ${statistics.carbohydrateCount}g`);
    }
    if (statistics.lipidCount) {
      parts.push(`Lipides: ${statistics.lipidCount}g`);
    }
  }

  return parts.length > 0 ? `Profil:\n${parts.join('\n')}` : "Profil utilisateur limité.";
}

/**
 * Calcule les métriques de performance basées sur les graphiques affichés
 * @param {Array} activities - Tableau des activités
 * @returns {string} Texte formaté des métriques avec les données des graphiques
 */
export function formatPerformanceMetrics(activities) {
  if (!activities || activities.length === 0) {
    return "Aucune métrique de performance disponible.";
  }

  // ===== DONNÉES DU GRAPHIQUE KM (4 dernières semaines complètes) =====
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDayOfWeek = today.getDay();
  const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  
  // Lundi de cette semaine
  const mondayThisWeek = new Date(today);
  mondayThisWeek.setDate(today.getDate() - daysSinceMonday);
  
  // Lundi de 4 semaines avant
  const mondayFourWeeksAgo = new Date(mondayThisWeek);
  mondayFourWeeksAgo.setDate(mondayThisWeek.getDate() - 28);
  
  // Dimanche de la semaine avant cette semaine
  const sundayLastWeek = new Date(mondayThisWeek);
  sundayLastWeek.setDate(mondayThisWeek.getDate() - 1);
  
  const last4WeeksData = activities.filter(session => {
    // Parser la date sans conversion UTC
    const [year, month, day] = session.date.split('-').map(Number);
    const sessionDate = new Date(year, month - 1, day);
    return sessionDate >= mondayFourWeeksAgo && sessionDate <= sundayLastWeek;
  });
  
  // Grouper par semaine comme dans le graphique KM
  const weeklyData = [];
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(mondayFourWeeksAgo);
    weekStart.setDate(mondayFourWeeksAgo.getDate() + week * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekData = last4WeeksData.filter(session => {
      const [year, month, day] = session.date.split('-').map(Number);
      const sessionDate = new Date(year, month - 1, day);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });
    
    const totalKm = weekData.reduce((sum, session) => sum + session.distance, 0);
    weeklyData.push({
      week: week + 1,
      totalKm: parseFloat(totalKm.toFixed(1)),
      sessions: weekData.length
    });
  }

  // ===== DONNÉES DU GRAPHIQUE BPM (semaine courante) =====
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const sundayThisWeek = new Date(mondayThisWeek);
  sundayThisWeek.setDate(mondayThisWeek.getDate() + 6);
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const weeklyBPMData = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(mondayThisWeek);
    currentDay.setDate(mondayThisWeek.getDate() + i);
    const dateStr = formatLocalDate(currentDay);
    
    const sessionForDay = activities.find(session => session.date === dateStr);
    
    if (sessionForDay) {
      weeklyBPMData.push({
        day: dayNames[i],
        date: dateStr,
        min: sessionForDay.heartRate.min,
        max: sessionForDay.heartRate.max,
        average: sessionForDay.heartRate.average
      });
    }
  }

  // ===== FORMATAGE DU CONTEXTE =====
  let result = "📊 DONNÉES DES GRAPHIQUES:\n\n";
  
  result += "🏃 Kilométrage - 4 dernières semaines:\n";
  weeklyData.forEach(w => {
    result += `  Semaine ${w.week}: ${w.totalKm}km (${w.sessions} séance${w.sessions > 1 ? 's' : ''})\n`;
  });
  
  const totalKm4Weeks = weeklyData.reduce((sum, w) => sum + w.totalKm, 0);
  const avgKm4Weeks = (totalKm4Weeks / 4).toFixed(1);
  result += `  Total: ${totalKm4Weeks.toFixed(1)}km | Moyenne: ${avgKm4Weeks}km/semaine\n\n`;

  result += `❤️ Fréquence cardiaque - Semaine courante (${formatLocalDate(mondayThisWeek)} à ${formatLocalDate(sundayThisWeek)}):\n`;
  if (weeklyBPMData.length > 0) {
    weeklyBPMData.forEach(day => {
      result += `  ${day.day} (${day.date}): Min=${day.min} Max=${day.max} Avg=${day.average} bpm\n`;
    });
    const avgBPM = (weeklyBPMData.reduce((sum, d) => sum + d.average, 0) / weeklyBPMData.length).toFixed(0);
    result += `  Moyenne semaine: ${avgBPM} bpm\n`;
  } else {
    result += "  Aucune activité cette semaine\n";
  }

  return result;
}

/**
 * Crée le contexte complet pour l'IA
 * @param {Object} params - Paramètres
 * @param {Object} params.user - Utilisateur
 * @param {Object} params.statistics - Statistiques
 * @param {Array} params.activities - Activités
 * @returns {string} Contexte formaté pour l'IA (jamais null)
 */
export function buildUserContext({ user, statistics, activities }) {
  const sections = [];

  // Profil utilisateur (toujours inclure le nom au moins)
  const profile = formatUserProfile(user, statistics);
  if (profile && !profile.includes("non disponible")) {
    sections.push(profile);
  }

  // Métriques de performance
  if (activities && activities.length > 0) {
    sections.push(formatPerformanceMetrics(activities));
    sections.push(formatRecentActivities(activities, 7)); // Réduit à 7 pour éviter la surcharge
    // Estimation du niveau utilisateur
    const level = estimateUserLevel(activities);
    if (level) {
      sections.push(`Niveau estimé: ${level}`);
    }
  } else {
    // Informer que les données se chargent ou ne sont pas disponibles
    sections.push("⚠️ Données d'activité: Chargement en cours ou aucune donnée disponible pour le moment.");
  }

  // Toujours retourner un contexte, même minimal
  const context = sections.length > 0 
    ? sections.join('\n\n')
    : "Données utilisateur chargement en cours...";

  return `[DONNÉES UTILISATEUR SPORTSEE - À UTILISER IMPÉRATIVEMENT]
📅 DATE ACTUELLE: 2025-12-18
${context}

⚠️ INSTRUCTION: Utilise UNIQUEMENT ces données pour répondre. Ne invente rien.`;
}

/**
 * Estime le niveau de l'utilisateur basé sur ses activités
 * @param {Array} activities - Activités de l'utilisateur
 * @returns {string} Niveau estimé: "débutant", "intermédiaire", "avancé"
 */
export function estimateUserLevel(activities) {
  if (!activities || activities.length < 5) {
    return "débutant";
  }

  const avgDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0) / activities.length;
  const avgDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0) / activities.length;
  const frequency = activities.length / 30; // Activités par mois (sur base de 30 jours)

  // Critères simples d'estimation
  if (avgDistance > 10 && avgDuration > 60 && frequency > 3) {
    return "avancé";
  } else if (avgDistance > 5 && avgDuration > 30 && frequency > 2) {
    return "intermédiaire";
  }
  
  return "débutant";
}
