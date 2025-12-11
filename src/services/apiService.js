// Service API pour gérer les appels vers le backend

// Import de la configuration centralisée
import { USE_MOCK_DATA, getEndpointUrl } from '../config/dataSource.js';

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
  
  // Erreur de connexion réseau
  if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
    throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est lancé sur http://localhost:8000');
  }
  
  // Erreur de timeout
  if (error.name === 'AbortError') {
    throw new Error('Le serveur met trop de temps à répondre. Vérifiez que le backend est lancé.');
  }
  
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      const response = await fetch(getEndpointUrl('login'), {
        method: 'POST',
        ...fetchConfig,
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
      // Décoder le vrai JWT pour extraire l'userId
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch {
        return 'user123'; // Fallback si le décodage échoue
      }
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      const response = await fetch(getEndpointUrl('userInfo'), {
        headers: getAuthHeaders(token),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
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
      let url = getEndpointUrl('userActivity');
      
      // Ajouter les paramètres de date si fournis
      if (startWeek && endWeek) {
        const params = new URLSearchParams({ startWeek, endWeek });
        url += `?${params.toString()}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      const response = await fetch(url, {
        headers: getAuthHeaders(token),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
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

      const response = await fetch(`${getEndpointUrl('userInfo').replace('/api/user-info', '')}/health`, {
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
    return getEndpointUrl('userInfo').replace('/api/user-info', '');
  }
};

// Export par défaut du service complet
export default {
  auth: authService,
  user: userService,
  health: healthService,
  config: apiConfig
};