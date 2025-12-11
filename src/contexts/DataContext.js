'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

// Types d'actions pour le reducer
const DATA_ACTIONS = {
  LOADING_START: 'LOADING_START',
  LOADING_END: 'LOADING_END',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_USER_STATISTICS: 'SET_USER_STATISTICS',
  SET_USER_ACTIVITY: 'SET_USER_ACTIVITY',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_DATA: 'RESET_DATA'
};

// État initial
const initialState = {
  // Données utilisateur
  profile: null,
  statistics: null,
  activity: [],
  
  // États de chargement
  isLoadingProfile: false,
  isLoadingStatistics: false,
  isLoadingActivity: false,
  
  // Gestion des erreurs
  errors: {
    profile: null,
    statistics: null,
    activity: null
  },
  
  // Métadonnées
  lastUpdated: null
};

// Reducer pour gérer l'état des données
function dataReducer(state, action) {
  switch (action.type) {
    case DATA_ACTIONS.LOADING_START:
      return {
        ...state,
        [`isLoading${action.payload.type}`]: true,
        errors: {
          ...state.errors,
          [action.payload.type.toLowerCase()]: null
        }
      };
      
    case DATA_ACTIONS.LOADING_END:
      return {
        ...state,
        [`isLoading${action.payload.type}`]: false
      };
      
    case DATA_ACTIONS.SET_USER_PROFILE:
      return {
        ...state,
        profile: action.payload.profile,
        isLoadingProfile: false,
        lastUpdated: new Date().toISOString(),
        errors: {
          ...state.errors,
          profile: null
        }
      };
      
    case DATA_ACTIONS.SET_USER_STATISTICS:
      return {
        ...state,
        statistics: action.payload.statistics,
        isLoadingStatistics: false,
        lastUpdated: new Date().toISOString(),
        errors: {
          ...state.errors,
          statistics: null
        }
      };
      
    case DATA_ACTIONS.SET_USER_ACTIVITY:
      return {
        ...state,
        activity: action.payload.activity,
        isLoadingActivity: false,
        lastUpdated: new Date().toISOString(),
        errors: {
          ...state.errors,
          activity: null
        }
      };
      
    case DATA_ACTIONS.SET_ERROR:
      return {
        ...state,
        [`isLoading${action.payload.type}`]: false,
        errors: {
          ...state.errors,
          [action.payload.type.toLowerCase()]: action.payload.error
        }
      };
      
    case DATA_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: null
        }
      };
      
    case DATA_ACTIONS.RESET_DATA:
      return initialState;
      
    default:
      return state;
  }
}

// Création du contexte
const DataContext = createContext();

// Provider du contexte de données
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, token, isAuthenticated } = useAuth();

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = useCallback(async () => {
    if (!token || !user?.id) return;

    dispatch({ type: DATA_ACTIONS.LOADING_START, payload: { type: 'Profile' } });

    try {
      const userInfo = await apiService.user.getUserInfo(token);
      dispatch({
        type: DATA_ACTIONS.SET_USER_PROFILE,
        payload: { profile: userInfo.profile }
      });
    } catch (error) {
      dispatch({
        type: DATA_ACTIONS.SET_ERROR,
        payload: { type: 'Profile', error: error.message }
      });
    }
  }, [token, user?.id]);

  // Fonction pour charger les statistiques utilisateur
  const loadUserStatistics = useCallback(async () => {
    if (!token || !user?.id) return;

    dispatch({ type: DATA_ACTIONS.LOADING_START, payload: { type: 'Statistics' } });

    try {
      const userInfo = await apiService.user.getUserInfo(token);
      dispatch({
        type: DATA_ACTIONS.SET_USER_STATISTICS,
        payload: { statistics: userInfo.statistics }
      });
    } catch (error) {
      dispatch({
        type: DATA_ACTIONS.SET_ERROR,
        payload: { type: 'Statistics', error: error.message }
      });
    }
  }, [token, user?.id]);

  // Fonction pour charger l'activité utilisateur
  const loadUserActivity = useCallback(async (startWeek = null, endWeek = null, userCreatedAt = null) => {
    if (!token || !user?.id) return;

    dispatch({ type: DATA_ACTIONS.LOADING_START, payload: { type: 'Activity' } });

    try {
      // Si pas de dates fournies, utiliser la date d'inscription et aujourd'hui
      let start = startWeek;
      let end = endWeek || new Date().toISOString().split('T')[0];
      
      // Si pas de date de début, utiliser createdAt passé en paramètre ou fallback
      if (!start) {
        start = userCreatedAt || '2025-01-01';
      }
      
      const activity = await apiService.user.getUserActivity(token, start, end);
      dispatch({
        type: DATA_ACTIONS.SET_USER_ACTIVITY,
        payload: { activity }
      });
    } catch (error) {
      dispatch({
        type: DATA_ACTIONS.SET_ERROR,
        payload: { type: 'Activity', error: error.message }
      });
    }
  }, [token, user?.id]);

  // Fonction pour charger toutes les données
  const loadAllUserData = useCallback(async () => {
    try {
      // Charger le profil d'abord pour obtenir createdAt
      const userInfo = await apiService.user.getUserInfo(token);
      
      // Dispatcher les données du profil et statistiques
      dispatch({
        type: DATA_ACTIONS.SET_USER_PROFILE,
        payload: { profile: userInfo.profile }
      });
      dispatch({
        type: DATA_ACTIONS.SET_USER_STATISTICS,
        payload: { statistics: userInfo.statistics }
      });
      
      // Charger l'activité avec la date d'inscription
      await loadUserActivity(null, null, userInfo.profile.createdAt);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [token, loadUserActivity]);

  // Fonction pour actualiser les données
  const refreshData = useCallback(async () => {
    await loadAllUserData();
  }, [loadAllUserData]);

  // Fonction pour effacer une erreur spécifique
  const clearError = useCallback((type) => {
    dispatch({ type: DATA_ACTIONS.CLEAR_ERROR, payload: { type } });
  }, []);

  // Charger les données automatiquement quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && token && user) {
      loadAllUserData();
    } else {
      // Réinitialiser les données quand l'utilisateur se déconnecte
      dispatch({ type: DATA_ACTIONS.RESET_DATA });
    }
  }, [isAuthenticated, token, user, loadAllUserData]);

  // Calculer les métriques dérivées avec mémorisation
  const derivedMetrics = useMemo(() => {
    if (state.activity.length === 0) {
      return {
        averageDistance: 0,
        averageHeartRate: 0,
        totalCalories: 0,
        weeklySessionsCount: 0,
        isLoading: state.isLoadingProfile || state.isLoadingStatistics || state.isLoadingActivity,
        hasErrors: Object.values(state.errors).some(error => error !== null)
      };
    }

    return {
      // Distance moyenne par session
      averageDistance: parseFloat((state.activity.reduce((sum, session) => sum + session.distance, 0) / state.activity.length).toFixed(1)),
      
      // Fréquence cardiaque moyenne
      averageHeartRate: Math.round(state.activity.reduce((sum, session) => sum + session.heartRate.average, 0) / state.activity.length),
      
      // Total des calories brûlées
      totalCalories: state.activity.reduce((sum, session) => sum + session.caloriesBurned, 0),
      
      // Nombre de sessions cette semaine
      weeklySessionsCount: state.activity.length,
      
      // Statut général de chargement
      isLoading: state.isLoadingProfile || state.isLoadingStatistics || state.isLoadingActivity,
      
      // Statut des erreurs
      hasErrors: Object.values(state.errors).some(error => error !== null)
    };
  }, [state.activity, state.isLoadingProfile, state.isLoadingStatistics, state.isLoadingActivity, state.errors]);

  // Mémoriser la valeur du contexte pour éviter les re-renders inutiles
  const value = useMemo(() => ({
    // Données
    profile: state.profile,
    statistics: state.statistics,
    activity: state.activity,
    
    // États de chargement
    isLoadingProfile: state.isLoadingProfile,
    isLoadingStatistics: state.isLoadingStatistics,
    isLoadingActivity: state.isLoadingActivity,
    
    // Erreurs
    errors: state.errors,
    
    // Métriques dérivées
    ...derivedMetrics,
    
    // Actions
    loadUserProfile,
    loadUserStatistics,
    loadUserActivity,
    loadAllUserData,
    refreshData,
    clearError,
    
    // Métadonnées
    lastUpdated: state.lastUpdated
  }), [
    state.profile,
    state.statistics, 
    state.activity,
    state.isLoadingProfile,
    state.isLoadingStatistics,
    state.isLoadingActivity,
    state.errors,
    state.lastUpdated,
    derivedMetrics,
    loadUserProfile,
    loadUserStatistics,
    loadUserActivity,
    loadAllUserData,
    refreshData,
    clearError
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Hook pour utiliser le contexte de données
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}