// Configuration centralisée des routes de l'application SportSee

/**
 * Définition des routes de l'application
 */
export const ROUTES = {
  // Routes publiques (non authentifiées)
  HOME: '/',
  LOGIN: '/login',
  
  // Routes protégées (authentifiées)
  DASHBOARD: '/dashboard',
  PROFILE: '/profile', // Route future pour le profil utilisateur
  
  // Routes d'erreur
  NOT_FOUND: '/404'
};

/**
 * Routes qui nécessitent une authentification
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE
];

/**
 * Routes publiques (accès sans authentification)
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.NOT_FOUND
];

/**
 * Route par défaut pour les utilisateurs authentifiés
 */
export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.DASHBOARD;

/**
 * Route par défaut pour les utilisateurs non authentifiés
 */
export const DEFAULT_UNAUTHENTICATED_ROUTE = ROUTES.LOGIN;

/**
 * Vérification si une route nécessite une authentification
 * @param {string} pathname - Chemin de la route
 * @returns {boolean} - true si la route nécessite une authentification
 */
export const isProtectedRoute = (pathname) => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * Vérification si une route est publique
 * @param {string} pathname - Chemin de la route
 * @returns {boolean} - true si la route est publique
 */
export const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.includes(pathname);
};

/**
 * Configuration de navigation pour les liens
 */
export const NAVIGATION_CONFIG = {
  // Navigation principale pour les utilisateurs authentifiés
  mainNavigation: [
    {
      label: 'Tableau de bord',
      path: ROUTES.DASHBOARD,
      icon: '📊',
      description: 'Vue d\'ensemble de vos performances'
    }
    // Ajouter d'autres liens au fur et à mesure
  ],
  
  // Navigation utilisateur
  userNavigation: [
    {
      label: 'Profil',
      path: ROUTES.PROFILE,
      icon: '👤',
      description: 'Gérer votre profil'
    },
    {
      label: 'Se déconnecter',
      path: ROUTES.LOGIN,
      icon: '🚪',
      description: 'Quitter l\'application',
      action: 'logout'
    }
  ]
};

/**
 * Messages d'erreur de navigation
 */
export const NAVIGATION_ERRORS = {
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page',
  NOT_FOUND: 'La page demandée n\'existe pas',
  SERVER_ERROR: 'Une erreur serveur s\'est produite'
};

/**
 * Configuration des redirections
 */
export const REDIRECT_CONFIG = {
  // Délai avant redirection (en ms)
  REDIRECT_DELAY: 2000,
  
  // Redirections automatiques
  redirects: {
    // Redirection après login réussi
    afterLogin: ROUTES.DASHBOARD,
    
    // Redirection après logout
    afterLogout: ROUTES.LOGIN,
    
    // Redirection par défaut pour route inexistante
    notFound: ROUTES.LOGIN
  }
};

/**
 * Utilitaires de navigation
 */
export const navigationUtils = {
  /**
   * Construction d'URL avec paramètres
   * @param {string} route - Route de base
   * @param {object} params - Paramètres à ajouter
   * @returns {string} - URL construite
   */
  buildUrl(route, params = {}) {
    const url = new URL(route, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.pathname + url.search;
  },
  
  /**
   * Obtenir la route parente
   * @param {string} pathname - Chemin actuel
   * @returns {string} - Route parente
   */
  getParentRoute(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return ROUTES.HOME;
    return '/' + segments.slice(0, -1).join('/');
  },
  
  /**
   * Vérifier si c'est la route actuelle
   * @param {string} pathname - Chemin actuel
   * @param {string} route - Route à vérifier
   * @returns {boolean} - true si c'est la route actuelle
   */
  isCurrentRoute(pathname, route) {
    return pathname === route || pathname.startsWith(route + '/');
  }
};

export default {
  ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  DEFAULT_AUTHENTICATED_ROUTE,
  DEFAULT_UNAUTHENTICATED_ROUTE,
  isProtectedRoute,
  isPublicRoute,
  NAVIGATION_CONFIG,
  NAVIGATION_ERRORS,
  REDIRECT_CONFIG,
  navigationUtils
};