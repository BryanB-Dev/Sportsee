/**
 * Configuration de la source de données
 * 
 * Pour basculer entre mock et API backend:
 * - true: Utilise les données mockées (dev/test)
 * - false: Utilise l'API backend réelle
 */
export const USE_MOCK_DATA = false;

/**
 * Configuration de l'API backend
 */
export const API_CONFIG = {
  baseUrl: 'http://localhost:8000',
  endpoints: {
    login: '/api/login',
    userInfo: '/api/user-info',
    userActivity: '/api/user-activity'
  }
};

/**
 * Helper pour obtenir l'URL complète d'un endpoint
 */
export const getEndpointUrl = (endpointKey) => {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpointKey]}`;
};
