// Service API pour gérer les appels vers le backend avec fallback sur les mocks
// Permet de développer avec des données mockées puis de basculer vers l'API réelle

const API_BASE_URL = 'http://localhost:8000/api';
const USE_MOCK_DATA = true; // Basculer à false pour utiliser la vraie API

// Import des données mockées
import { 
  mockLogin, 
  mockGetUserInfo, 
  mockGetUserActivity,
  mockAuthUsers,
  mockUserInfo,
  mockUserActivity
} from '../mocks/apiData.js';

/**
 * Configuration globale pour les requêtes fetch
 */
const fetchConfig = {
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Utilitaire pour ajouter le token d'authentification aux headers
 */
const getAuthHeaders = (token) => ({
  ...fetchConfig.headers,
  'Authorization': `Bearer ${token}`
});

/**
 * Gestion d'erreur API standardisée
 */
const handleApiError = (error, fallbackMessage) => {
  console.error('API Error:', error);
  throw new Error(fallbackMessage || 'Erreur lors de la communication avec le serveur');
};

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<{token: string, userId: string}>}
   */
  async login(username, password) {
    if (USE_MOCK_DATA) {
      return await mockLogin(username, password);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        ...fetchConfig,
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec de l\'authentification');
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, 'Erreur lors de la connexion');
    }
  },

  /**
   * Vérification de la validité du token
   * @param {string} token - Token JWT à vérifier
   * @returns {boolean}
   */
  isTokenValid(token) {
    if (!token) return false;
    
    if (USE_MOCK_DATA) {
      // Accepter les vrais tokens JWT en plus des mocks
      return token.startsWith('eyJ') || token.startsWith('mock-jwt-token-');
    }

    try {
      // Vérification basique du format JWT
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  },

  /**
   * Extraction de l'userId depuis le token
   * @param {string} token - Token JWT
   * @returns {string|null}
   */
  getUserIdFromToken(token) {
    if (!token) return null;
    
    if (USE_MOCK_DATA) {
      // Gestion des vrais tokens et des mocks
      if (token.startsWith('mock-jwt-token-')) {
        return token.replace('mock-jwt-token-', '');
      }
      // Pour les vrais tokens, retourner l'userId par défaut
      return 'user123';
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  }
};

/**
 * Service de données utilisateur
 */
export const userService = {
  /**
   * Récupération des informations utilisateur
   * @param {string} token - Token d'authentification
   * @returns {Promise<Object>}
   */
  async getUserInfo(token) {
    const userId = authService.getUserIdFromToken(token);
    
    if (!userId) {
      throw new Error('Token invalide');
    }

    if (USE_MOCK_DATA) {
      return await mockGetUserInfo(userId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user-info`, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur');
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, 'Impossible de récupérer les informations utilisateur');
    }
  },

  /**
   * Récupération de l'activité utilisateur
   * @param {string} token - Token d'authentification
   * @param {string} startWeek - Date de début (ISO format)
   * @param {string} endWeek - Date de fin (ISO format)
   * @returns {Promise<Array>}
   */
  async getUserActivity(token, startWeek = null, endWeek = null) {
    const userId = authService.getUserIdFromToken(token);
    
    if (!userId) {
      throw new Error('Token invalide');
    }

    if (USE_MOCK_DATA) {
      return await mockGetUserActivity(userId, startWeek, endWeek);
    }

    try {
      let url = `${API_BASE_URL}/user-activity`;
      
      // Ajouter les paramètres de date si fournis
      if (startWeek && endWeek) {
        const params = new URLSearchParams({ startWeek, endWeek });
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'activité');
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, 'Impossible de récupérer l\'activité utilisateur');
    }
  }
};

/**
 * Service de santé de l'API
 */
export const healthService = {
  /**
   * Vérification de la disponibilité de l'API
   * @returns {Promise<boolean>}
   */
  async checkApiHealth() {
    if (USE_MOCK_DATA) {
      return true;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        method: 'GET'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
};

/**
 * Configuration du service API
 */
export const apiConfig = {
  /**
   * Basculer entre mock et vraie API
   * @param {boolean} useMock - true pour utiliser les mocks, false pour la vraie API
   */
  setMockMode(useMock) {
    USE_MOCK_DATA = useMock;
  },

  /**
   * Obtenir l'état actuel du mode mock
   * @returns {boolean}
   */
  isMockMode() {
    return USE_MOCK_DATA;
  },

  /**
   * Obtenir l'URL de base de l'API
   * @returns {string}
   */
  getBaseUrl() {
    return API_BASE_URL;
  }
};

// Export par défaut du service complet
export default {
  auth: authService,
  user: userService,
  health: healthService,
  config: apiConfig
};