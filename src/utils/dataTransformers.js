// Utilitaires pour transformer les données de l'API en format optimisé pour les graphiques
// Utilise les données réelles de l'API de course pour créer des visualisations pour le dashboard

/**
 * Transforme les données d'activité en format pour graphique en barres (distance et calories)
 * Compatible avec Recharts BarChart
 */
export const transformActivityForBarChart = (activityData) => {
  return activityData.map((session, index) => ({
    day: index + 1, // Jour relatif (1, 2, 3...)
    date: session.date,
    distance: parseFloat(session.distance.toFixed(1)),
    calories: session.caloriesBurned,
    duration: session.duration
  }));
};

/**
 * Transforme les données d'activité en format pour graphique linéaire de durée moyenne
 * Compatible avec Recharts LineChart
 */
export const transformActivityForLineChart = (activityData) => {
  // Grouper par jour de la semaine et calculer la moyenne
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weekData = dayNames.map((dayName, index) => {
    // Filtrer les sessions du même jour de la semaine
    const sessionsForDay = activityData.filter(session => {
      const date = new Date(session.date);
      return date.getDay() === (index + 1) % 7; // Ajuster pour commencer par lundi
    });
    
    // Calculer la durée moyenne
    const averageDuration = sessionsForDay.length > 0 
      ? Math.round(sessionsForDay.reduce((sum, session) => sum + session.duration, 0) / sessionsForDay.length)
      : 0;
    
    return {
      day: index + 1,
      dayName,
      sessionLength: averageDuration
    };
  });
  
  return weekData;
};

/**
 * Transforme les données d'activité en format pour graphique radar des performances
 * Compatible avec Recharts RadarChart
 */
export const transformActivityForRadarChart = (activityData, userProfile) => {
  if (!activityData.length) return [];
  
  // Calculer des métriques de performance basées sur les données de course
  const totalDistance = activityData.reduce((sum, session) => sum + session.distance, 0);
  const totalDuration = activityData.reduce((sum, session) => sum + session.duration, 0);
  const avgPace = totalDuration / totalDistance; // min/km
  const avgHeartRate = activityData.reduce((sum, session) => sum + session.heartRate.average, 0) / activityData.length;
  const maxDistance = Math.max(...activityData.map(session => session.distance));
  const consistency = (activityData.length / 7) * 100; // Pourcentage de jours d'activité
  
  // Normaliser les valeurs sur 100 pour le radar
  const normalizeValue = (value, max) => Math.min(Math.round((value / max) * 100), 100);
  
  return [
    { 
      subject: 'Intensité', 
      A: normalizeValue(avgHeartRate, 200), // FC max théorique 
      fullMark: 100 
    },
    { 
      subject: 'Vitesse', 
      A: normalizeValue(60 / avgPace, 20), // Conversion en km/h normalisé
      fullMark: 100 
    },
    { 
      subject: 'Force', 
      A: normalizeValue(maxDistance, 15), // Distance max normalisée
      fullMark: 100 
    },
    { 
      subject: 'Endurance', 
      A: normalizeValue(totalDistance, 50), // Distance totale normalisée
      fullMark: 100 
    },
    { 
      subject: 'Energie', 
      A: normalizeValue(totalDuration, 300), // Durée totale normalisée (5h max)
      fullMark: 100 
    },
    { 
      subject: 'Cardio', 
      A: consistency, // Consistance directement en pourcentage
      fullMark: 100 
    }
  ];
};

/**
 * Calcule le score de progression vers l'objectif hebdomadaire
 * Retourne un pourcentage de 0 à 1
 */
export const calculateWeeklyGoalProgress = (activityData, weeklyGoal) => {
  const currentWeekSessions = activityData.filter(session => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Début de semaine (lundi)
    return sessionDate >= weekStart;
  });
  
  const progress = Math.min(currentWeekSessions.length / weeklyGoal, 1);
  return parseFloat(progress.toFixed(2));
};

/**
 * Calcule les statistiques clés pour les cartes du dashboard
 */
export const calculateKeyStats = (activityData, userProfile) => {
  if (!activityData.length) {
    return {
      calorieCount: 0,
      proteinCount: 0,
      carbohydrateCount: 0,
      lipidCount: 0
    };
  }
  
  const totalCalories = activityData.reduce((sum, session) => sum + session.caloriesBurned, 0);
  const avgDuration = activityData.reduce((sum, session) => sum + session.duration, 0) / activityData.length;
  const totalDistance = activityData.reduce((sum, session) => sum + session.distance, 0);
  
  // Estimer les macronutriments basés sur l'activité et le profil utilisateur
  // Ces calculs sont approximatifs pour la démonstration
  const estimatedProtein = Math.round(userProfile.weight * 1.5); // 1.5g/kg pour sportif
  const estimatedCarbs = Math.round(totalDistance * 30); // 30g par km pour reconstitution
  const estimatedFat = Math.round(totalCalories * 0.25 / 9); // 25% des calories en lipides
  
  return {
    calorieCount: Math.round(totalCalories),
    proteinCount: estimatedProtein,
    carbohydrateCount: estimatedCarbs,
    lipidCount: estimatedFat
  };
};

/**
 * Génère des données mockées structurées pour tous les graphiques
 */
export const generateDashboardData = (userId, userInfo, activityData) => {
  const { profile, statistics, weeklyGoal } = userInfo;
  
  return {
    user: {
      id: userId,
      firstName: profile.firstName,
      lastName: profile.lastName
    },
    keyData: calculateKeyStats(activityData, profile),
    todayScore: calculateWeeklyGoalProgress(activityData, weeklyGoal),
    activity: transformActivityForBarChart(activityData),
    averageSessions: transformActivityForLineChart(activityData),
    performance: transformActivityForRadarChart(activityData, profile),
    statistics: {
      ...statistics,
      weeklyGoal
    }
  };
};

// Export des données mockées pour chaque utilisateur
export const mockDashboardData = {
  'user123': null, // Sera généré à la demande
  'user456': null,
  'user789': null
};