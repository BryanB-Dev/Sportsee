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

  const recentActivities = activities.slice(-limit);
  const formattedActivities = recentActivities.map((activity, index) => {
    const date = new Date(activity.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    // Extraire la fréquence cardiaque moyenne si c'est un objet
    const heartRate = activity.heartRate?.average || activity.heartRate || 'N/A';
    
    return `${index + 1}. ${date}: ${activity.distance || 0}km parcourus, ${activity.duration || 0}min d'effort, fréquence cardiaque moyenne ${heartRate} bpm`;
  }).join('\n');

  return `Dernières activités (${recentActivities.length} séances):\n${formattedActivities}`;
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
 * Calcule les métriques de performance récentes
 * @param {Array} activities - Tableau des activités
 * @returns {string} Texte formaté des métriques
 */
export function formatPerformanceMetrics(activities) {
  if (!activities || activities.length === 0) {
    return "Aucune métrique de performance disponible.";
  }

  const recentActivities = activities.slice(-10);
  
  // Calculs de moyennes
  const totalDistance = recentActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalDuration = recentActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
  const avgDistance = (totalDistance / recentActivities.length).toFixed(1);
  const avgDuration = (totalDuration / recentActivities.length).toFixed(0);
  
  // Fréquence cardiaque - extraire la valeur average si c'est un objet
  const heartRates = recentActivities
    .filter(a => a.heartRate)
    .map(a => a.heartRate?.average || a.heartRate)
    .filter(hr => typeof hr === 'number' && !isNaN(hr));
  
  const avgHeartRate = heartRates.length > 0 
    ? (heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length).toFixed(0)
    : 'N/A';

  // Tendance (comparaison dernière semaine vs précédente)
  const lastWeek = activities.slice(-7);
  const previousWeek = activities.slice(-14, -7);
  
  let trend = "stable";
  if (lastWeek.length > 0 && previousWeek.length > 0) {
    const lastWeekAvg = lastWeek.reduce((sum, a) => sum + (a.distance || 0), 0) / lastWeek.length;
    const prevWeekAvg = previousWeek.reduce((sum, a) => sum + (a.distance || 0), 0) / previousWeek.length;
    
    if (lastWeekAvg > prevWeekAvg * 1.1) trend = "en progression";
    else if (lastWeekAvg < prevWeekAvg * 0.9) trend = "en baisse";
  }

  return `Métriques des 10 dernières séances:
- Distance moyenne: ${avgDistance}km
- Durée moyenne: ${avgDuration}min
- Fréquence cardiaque moyenne: ${avgHeartRate} bpm
- Tendance: ${trend}`;
}

/**
 * Crée le contexte complet pour l'IA
 * @param {Object} params - Paramètres
 * @param {Object} params.user - Utilisateur
 * @param {Object} params.statistics - Statistiques
 * @param {Array} params.activities - Activités
 * @returns {string} Contexte formaté pour l'IA
 */
export function buildUserContext({ user, statistics, activities }) {
  const sections = [];

  // Profil utilisateur
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
  }

  if (sections.length === 0) {
    return null; // Pas de contexte à ajouter
  }

  return `[DONNÉES UTILISATEUR SPORTSEE]
${sections.join('\n\n')}

Ces données sont fournies automatiquement pour enrichir tes réponses. Utilise-les uniquement si elles sont pertinentes pour la question posée. Ne mentionne pas ces données si l'utilisateur pose une question générale sans rapport avec ses statistiques personnelles.`;
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
