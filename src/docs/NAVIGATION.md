# Documentation de la Navigation - SportSee

## 📋 Vue d'ensemble du système de navigation

Le système de navigation de SportSee est conçu avec NextJS App Router et inclut une gestion complète de l'authentification, de la protection des routes et du stockage sécurisé des tokens.

## 🏗️ Architecture des Routes

### Structure des dossiers
```
src/app/
├── layout.js           # Layout principal avec AuthProvider
├── page.js             # Page d'accueil avec redirection automatique
├── not-found.js        # Page 404 personnalisée
├── login/
│   ├── page.js         # Page de connexion (non-protégée)
│   └── login.module.css
└── dashboard/
    ├── page.js         # Tableau de bord (protégé)
    └── dashboard.module.css
```

## 🔐 Système d'Authentification

### Context API
- **Fichier** : `src/contexts/AuthContext.js`
- **Provider** : `AuthProvider` wrappé dans `layout.js`
- **Hook** : `useAuth()` pour accéder à l'état d'auth

### Stockage des tokens
- **Méthode** : Cookies sécurisés (recommandation respectée)
- **Durée** : 7 jours
- **Cookies** :
  - `sportsee_token` : Token JWT
  - `sportsee_user` : Informations utilisateur encodées

### États d'authentification
```javascript
{
  user: Object|null,          // Infos utilisateur
  token: string|null,         // Token JWT
  isAuthenticated: boolean,   // Statut de connexion
  isLoading: boolean,         // État de chargement
  error: string|null         // Erreur éventuelle
}
```

## 🛡️ Protection des Routes

### Routes publiques (non-protégées)
- `/` - Redirection automatique
- `/login` - Page de connexion
- `/404` - Page d'erreur

### Routes protégées
- `/dashboard` - Tableau de bord principal

### Mécanisme de protection
1. **HOC `withAuth`** : `src/components/withAuth.js`
2. **Vérification automatique** dans les composants de page
3. **Redirection** vers `/login` si non-authentifié

## 📊 Flux de Navigation

### Utilisateur non-connecté
```
/ → /login
/dashboard → /login (redirection)
/inexistant → /404
```

### Utilisateur connecté
```
/ → /dashboard
/login → /dashboard (redirection)
/dashboard → Accès autorisé
/inexistant → /404
```

## ⚙️ Configuration

### Fichier de configuration
- **Fichier** : `src/config/routes.js`
- **Contenu** : Routes, redirections, utilitaires

### Routes définies
```javascript
ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '/404'
}
```

## 🔧 Fonctionnalités Implémentées

### ✅ **Résultats attendus respectés**

#### 1. Structure de navigation fonctionnelle
- ✅ App Router NextJS configuré
- ✅ Routes publiques et protégées séparées
- ✅ Redirections automatiques

#### 2. Route de login non-authentifiée
- ✅ `/login` accessible sans authentification
- ✅ Redirection automatique si déjà connecté
- ✅ Comptes de test intégrés

#### 3. Système de stockage de token
- ✅ Cookies sécurisés (recommandation respectée)
- ✅ Expiration automatique (7 jours)
- ✅ Nettoyage automatique des tokens invalides

### ✅ **Recommandations respectées**

#### Fichier spécifique pour les routes
- ✅ `src/config/routes.js` pour centraliser les routes
- ✅ Configuration des redirections
- ✅ Utilitaires de navigation

#### Gestion des erreurs pour routes inexistantes
- ✅ Page 404 personnalisée avec design SportSee
- ✅ Boutons de retour adaptatifs selon l'état d'auth
- ✅ Navigation contextuelle

#### Stockage en cookie
- ✅ Implémentation avec cookies sécurisés
- ✅ Flags `secure` et `samesite=strict`
- ✅ Gestion automatique de l'expiration

## 🧪 Test de la Navigation

### Comptes de test disponibles
1. **Sophie Martin** : `sophiemartin` / `password123`
2. **Emma Leroy** : `emmaleroy` / `password789`
3. **Marc Dubois** : `marcdubois` / `password456`

### Scénarios de test
```
1. Accès à / → Redirection vers /login
2. Login avec compte valide → Redirection vers /dashboard
3. Accès direct à /dashboard sans auth → Redirection vers /login
4. Logout depuis /dashboard → Redirection vers /login
5. Accès à route inexistante → Page 404
6. Fermeture/réouverture navigateur → Session restaurée
```

## 🔄 Workflow d'Authentification

### Login
1. Utilisateur remplit le formulaire `/login`
2. Validation via API (mocks ou réel selon config)
3. Récupération du token JWT
4. Stockage dans cookies sécurisés
5. Redirection vers `/dashboard`

### Session restore
1. Au chargement de l'app, vérification des cookies
2. Validation du token stocké
3. Restauration automatique de la session
4. Redirection appropriée selon l'état

### Logout
1. Suppression des cookies
2. Reset de l'état d'authentification
3. Redirection vers `/login`

## 🎨 Interface Utilisateur

### Page de Login
- Design moderne avec dégradé SportSee
- Formulaire avec validation
- Boutons de test rapides
- Messages d'erreur contextuels
- Animation et transitions

### Page Dashboard
- Header avec nom d'utilisateur et logout
- Placeholder pour les graphiques (étape suivante)
- Métriques avec icônes
- Responsive design

### Page 404
- Design cohérent avec la charte SportSee
- Actions contextuelles selon l'auth
- Animation d'apparition

## 🚀 Prochaines Étapes

La navigation est maintenant complètement fonctionnelle et prête pour l'étape suivante :

1. **Intégration des hooks API** pour récupérer les vraies données
2. **Implémentation des graphiques Recharts**
3. **Développement des composants du dashboard**

L'architecture mise en place est robuste et extensible pour les futures fonctionnalités.