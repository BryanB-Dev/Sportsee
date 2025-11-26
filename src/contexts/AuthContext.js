'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/apiService';

// Types d'actions pour le reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  SET_LOADING: 'SET_LOADING'
};

// État initial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // true au démarrage pour vérifier la session
  error: null
};

// Utilitaires pour la gestion des cookies
const cookieUtils = {
  set(name, value, days = 7) {
    if (typeof document !== 'undefined') {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
    }
  },
  
  get(name) {
    if (typeof document !== 'undefined') {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  },
  
  delete(name) {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  }
};

// Reducer pour gérer l'état d'authentification
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };
    default:
      return state;
  }
}

// Création du contexte
const AuthContext = createContext();

// Provider du contexte d'authentification
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurer la session au chargement
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = cookieUtils.get('sportsee_token');
        const storedUser = cookieUtils.get('sportsee_user');
        
        if (storedToken && storedUser && apiService.auth.isTokenValid(storedToken)) {
          const user = JSON.parse(decodeURIComponent(storedUser));
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: { user, token: storedToken }
          });
        } else {
          // Nettoyer les cookies invalides
          cookieUtils.delete('sportsee_token');
          cookieUtils.delete('sportsee_user');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Erreur lors de la restauration de session:', error);
        cookieUtils.delete('sportsee_token');
        cookieUtils.delete('sportsee_user');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    restoreSession();
  }, []);

  // Fonction de connexion
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Appel API via notre service
      const response = await apiService.auth.login(username, password);
      
      const { token, userId } = response;
      
      // Récupérer les infos utilisateur
      const userInfo = await apiService.user.getUserInfo(token);
      
      const userSession = {
        id: userId,
        firstName: userInfo.profile.firstName,
        lastName: userInfo.profile.lastName
      };

      // Stocker dans les cookies
      cookieUtils.set('sportsee_token', token, 7); // 7 jours
      cookieUtils.set('sportsee_user', encodeURIComponent(JSON.stringify(userSession)), 7);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userSession, token }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    cookieUtils.delete('sportsee_token');
    cookieUtils.delete('sportsee_user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}