// Configuration centralisée des routes de l'application SportSee

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '/404'
};

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD
];

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.NOT_FOUND
];

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.DASHBOARD;

export const DEFAULT_UNAUTHENTICATED_ROUTE = ROUTES.LOGIN;

export const isProtectedRoute = (pathname) => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

export const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.includes(pathname);
};

export const NAVIGATION_CONFIG = {
  mainNavigation: [
    {
      label: 'Tableau de bord',
      path: ROUTES.DASHBOARD,
      icon: '📊'
    }
  ],
  
  userNavigation: [
    {
      label: 'Se déconnecter',
      path: ROUTES.LOGIN,
      icon: '🚪',
      action: 'logout'
    }
  ]
};

export default {
  ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  DEFAULT_AUTHENTICATED_ROUTE,
  DEFAULT_UNAUTHENTICATED_ROUTE,
  isProtectedRoute,
  isPublicRoute,
  NAVIGATION_CONFIG
};