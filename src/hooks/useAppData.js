'use client';

import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

/**
 * Hook personnalisé pour les métriques du dashboard
 * Calcule et formate les métriques principales
 */
export function useDashboardMetrics() {
  const { statistics, activity, profile, isLoading, errors } = useData();

  const metrics = useMemo(() => {
    if (!statistics || !activity || !profile) {
      return null;
    }

    // Calcul des calories moyennes par session
    const averageCaloriesPerSession = activity.length > 0 
      ? Math.round(activity.reduce((sum, session) => sum + session.caloriesBurned, 0) / activity.length)
      : 0;

    // Calcul de la distance moyenne par session
    const averageDistance = activity.length > 0 
      ? parseFloat((activity.reduce((sum, session) => sum + session.distance, 0) / activity.length).toFixed(1))
      : 0;

    // Calcul de la fréquence cardiaque moyenne
    const averageHeartRate = activity.length > 0
      ? Math.round(activity.reduce((sum, session) => sum + session.heartRate.average, 0) / activity.length)
      : 0;

    // Performance cette semaine (basé sur les 7 derniers jours)
    const weeklyPerformance = {
      sessionsCount: activity.length,
      totalDistance: activity.reduce((sum, session) => sum + session.distance, 0),
      totalDuration: activity.reduce((sum, session) => sum + session.duration, 0),
      totalCalories: activity.reduce((sum, session) => sum + session.caloriesBurned, 0)
    };

    return {
      // Statistiques globales
      totalDistance: statistics.totalDistance,
      totalSessions: statistics.totalSessions,
      totalDuration: statistics.totalDuration,
      
      // Moyennes
      averageDistance,
      averageHeartRate,
      averageCaloriesPerSession,
      
      // Performance hebdomadaire
      weeklyPerformance,
      
      // Informations utilisateur
      userInfo: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        profilePicture: profile.profilePicture,
        createdAt: profile.createdAt
      }
    };
  }, [statistics, activity, profile]);

  return {
    metrics,
    isLoading,
    hasErrors: Object.values(errors).some(error => error !== null),
    errors
  };
}

/**
 * Hook personnalisé pour les données de graphiques
 * Formate les données pour l'utilisation avec Recharts
 */
export function useChartData() {
  const { activity, isLoadingActivity, errors } = useData();

  const chartData = useMemo(() => {
    if (!activity || activity.length === 0) {
      return null;
    }

    // Données pour le graphique d'activité quotidienne (bar chart)
    const dailyActivityData = activity.map((session, index) => ({
      day: index + 1,
      distance: session.distance,
      calories: session.caloriesBurned,
      heartRate: session.heartRate.average,
      duration: session.duration,
      date: session.date
    }));

    // Données pour le graphique de durée de session (line chart)
    const sessionDurationData = activity.map((session, index) => ({
      day: ['L', 'M', 'M', 'J', 'V', 'S', 'D'][index] || `J${index + 1}`,
      sessionLength: session.duration
    }));

    // Données pour le graphique radar de performance
    const performanceData = activity.length > 0 ? [
      { subject: 'Cardio', value: Math.min(100, (activity.reduce((sum, s) => sum + s.heartRate.average, 0) / activity.length - 120) * 2), fullMark: 100 },
      { subject: 'Endurance', value: Math.min(100, (activity.reduce((sum, s) => sum + s.duration, 0) / activity.length - 20) * 2), fullMark: 100 },
      { subject: 'Vitesse', value: Math.min(100, (activity.reduce((sum, s) => sum + s.distance, 0) / activity.length) * 15), fullMark: 100 },
      { subject: 'Intensité', value: Math.min(100, (activity.reduce((sum, s) => sum + s.caloriesBurned, 0) / activity.length - 200) / 3), fullMark: 100 },
      { subject: 'Force', value: Math.min(100, activity.length * 10), fullMark: 100 },
      { subject: 'Énergie', value: Math.min(100, (activity.reduce((sum, s) => sum + s.caloriesBurned, 0) / activity.length - 200) / 4), fullMark: 100 }
    ] : [];

    // Calcul du score (basé sur la régularité et les performances)
    const scorePercentage = activity.length > 0 
      ? Math.min(100, (activity.length / 7) * 100) // Score basé sur le nombre de sessions par semaine
      : 0;

    return {
      dailyActivity: dailyActivityData,
      sessionDuration: sessionDurationData,
      performance: performanceData,
      scorePercentage
    };
  }, [activity]);

  return {
    chartData,
    isLoading: isLoadingActivity,
    hasError: errors.activity !== null,
    error: errors.activity
  };
}

/**
 * Hook personnalisé pour la gestion des erreurs
 * Fournit des utilitaires pour gérer les erreurs de l'application
 */
export function useErrorHandling() {
  const { errors, clearError } = useData();

  const errorUtils = useMemo(() => ({
    hasAnyError: Object.values(errors).some(error => error !== null),
    getErrorMessage: (type) => errors[type],
    getFormattedError: (type) => {
      const error = errors[type];
      if (!error) return null;
      
      // Messages d'erreur utilisateur-friendly
      const errorMessages = {
        'Réseau': 'Problème de connexion. Vérifiez votre connexion internet.',
        'Authentification': 'Session expirée. Veuillez vous reconnecter.',
        'Données introuvables': 'Aucune donnée disponible pour cette période.',
        'Erreur serveur': 'Erreur temporaire du service. Réessayez dans quelques instants.'
      };
      
      return errorMessages[error] || error;
    }
  }), [errors]);

  return {
    errors,
    clearError,
    ...errorUtils
  };
}

/**
 * Hook personnalisé pour les actions de données
 * Fournit des actions optimisées pour charger et actualiser les données
 */
export function useDataActions() {
  const { 
    loadUserProfile, 
    loadUserStatistics, 
    loadUserActivity, 
    loadAllUserData, 
    refreshData,
    isLoading
  } = useData();

  const actions = useMemo(() => ({
    // Actions de chargement avec gestion d'erreurs
    loadProfile: async () => {
      try {
        await loadUserProfile();
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    },
    
    loadStats: async () => {
      try {
        await loadUserStatistics();
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    },
    
    loadActivity: async (startWeek, endWeek) => {
      try {
        await loadUserActivity(startWeek, endWeek);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'activité:', error);
      }
    },
    
    loadAllData: async () => {
      try {
        await loadAllUserData();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    },
    
    refresh: async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error('Erreur lors de l\'actualisation:', error);
      }
    }
  }), [loadUserProfile, loadUserStatistics, loadUserActivity, loadAllUserData, refreshData]);

  return {
    ...actions,
    isLoading
  };
}