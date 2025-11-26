# Documentation - Gestion d'État Globale SportSee

## Vue d'ensemble

Le système de gestion d'état globale de SportSee utilise **React Context API** pour partager les données entre les composants de l'application. Le système est divisé en deux contextes principaux :

1. **AuthContext** - Gestion de l'authentification et des sessions utilisateur
2. **DataContext** - Gestion des données métier (profil, statistiques, activités)

## Architecture

```
src/
├── contexts/
│   ├── AuthContext.js     # Authentification et sessions
│   └── DataContext.js     # Données métier globales
├── hooks/
│   └── useAppData.js      # Hooks personnalisés pour l'accès aux données
├── components/
│   └── DataTester/        # Composant de test du système d'état
└── services/
    └── apiService.js      # Service d'API intégré aux contextes
```

## DataContext - Gestionnaire d'État Principal

### Données Gérées

#### Profil Utilisateur
```javascript
profile: {
  firstName: string,
  lastName: string,
  age: number,
  weight: number,
  height: number,
  profilePicture: string
}
```

#### Statistiques
```javascript
statistics: {
  totalDistance: string,    // Distance totale parcourue
  totalSessions: number,    // Nombre total de sessions
  totalDuration: number     // Durée totale d'entraînement
}
```

#### Activités
```javascript
activity: [{
  date: string,
  distance: number,
  duration: number,
  heartRate: {
    min: number,
    max: number,
    average: number
  },
  caloriesBurned: number
}]
```

### Actions Disponibles

- `loadUserProfile()` - Charger le profil utilisateur
- `loadUserStatistics()` - Charger les statistiques
- `loadUserActivity(startWeek?, endWeek?)` - Charger l'activité
- `loadAllUserData()` - Charger toutes les données
- `refreshData()` - Actualiser toutes les données
- `clearError(type)` - Effacer une erreur spécifique

### États de Chargement

- `isLoadingProfile` - Profil en cours de chargement
- `isLoadingStatistics` - Statistiques en cours de chargement  
- `isLoadingActivity` - Activité en cours de chargement
- `isLoading` - État global de chargement (dérivé)

### Gestion des Erreurs

```javascript
errors: {
  profile: string | null,
  statistics: string | null,
  activity: string | null
}
```

## Hooks Personnalisés

### useDashboardMetrics()

Calcule et formate les métriques principales du tableau de bord :

```javascript
const { metrics, isLoading, hasErrors } = useDashboardMetrics();

// metrics contient :
// - totalDistance, totalSessions, totalDuration
// - averageDistance, averageHeartRate, averageCaloriesPerSession
// - weeklyPerformance (sessions, distance, durée, calories)
// - userInfo (firstName, lastName, age, weight, height, profilePicture)
```

### useChartData()

Formate les données pour les graphiques Recharts :

```javascript
const { chartData, isLoading, hasError } = useChartData();

// chartData contient :
// - dailyActivity: données pour graphique en barres
// - sessionDuration: données pour graphique linéaire
// - performance: données pour graphique radar
// - scorePercentage: pourcentage de progression
```

### useNutritionalMetrics()

Calcule les besoins nutritionnels basés sur le profil et l'activité :

```javascript
const { nutritionalData } = useNutritionalMetrics();

// nutritionalData contient :
// - calories: besoins caloriques quotidiens
// - proteins: besoins en protéines (g)
// - carbohydrates: besoins en glucides (g)
// - fats: besoins en lipides (g)
```

### useErrorHandling()

Utilitaires pour la gestion des erreurs :

```javascript
const { hasAnyError, getFormattedError, clearError } = useErrorHandling();
```

### useDataActions()

Actions optimisées avec gestion d'erreurs :

```javascript
const { loadProfile, loadStats, loadActivity, loadAllData, refresh } = useDataActions();
```

## Utilisation

### Configuration dans layout.js

```javascript
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Dans un composant

```javascript
import { useDashboardMetrics, useNutritionalMetrics } from '../../hooks/useAppData';

export default function Dashboard() {
  const { metrics, isLoading, hasErrors } = useDashboardMetrics();
  const { nutritionalData } = useNutritionalMetrics();

  if (isLoading) return <div>Chargement...</div>;
  if (hasErrors) return <div>Erreur de chargement</div>;

  return (
    <div>
      <h1>Bonjour {metrics.userInfo.firstName}</h1>
      <p>Distance moyenne: {metrics.averageDistance} km</p>
      <p>Calories recommandées: {nutritionalData.calories} kCal</p>
    </div>
  );
}
```

## Optimisations de Performance

### Mémorisation
- Utilisation de `useMemo` pour les calculs coûteux
- Mémorisation de la valeur du contexte avec dépendances
- Hooks personnalisés avec `useMemo` pour éviter les re-calculs

### Chargement Intelligent
- Chargement automatique des données à la connexion
- Réinitialisation des données à la déconnexion
- Gestion granulaire des états de chargement

### Gestion des Erreurs
- Erreurs spécifiques par type de données
- Messages d'erreur formatés pour l'utilisateur
- Actions de récupération automatique

## Intégration avec AuthContext

Le DataContext est automatiquement synchronisé avec l'AuthContext :

- **Connexion** → Chargement automatique des données utilisateur
- **Déconnexion** → Réinitialisation complète des données
- **Token expiré** → Nettoyage et redirection

## Données Dérivées Calculées

Le système calcule automatiquement :

- Distance moyenne par session
- Fréquence cardiaque moyenne
- Total des calories brûlées
- Nombre de sessions hebdomadaires
- Besoins nutritionnels personnalisés
- Score de performance (basé sur régularité)

## Bonnes Pratiques

### ✅ À faire

- Utiliser les hooks personnalisés plutôt que le contexte directement
- Gérer les états de chargement dans l'interface
- Afficher des messages d'erreur utilisateur-friendly
- Nettoyer les erreurs après résolution

### ❌ À éviter

- Accéder directement au contexte sans les hooks
- Ignorer les états de chargement et d'erreur
- Surcharger le contexte avec des données temporaires
- Oublier de gérer les cas d'absence de données

## Tests

Un composant `DataTester` est fourni pour valider le système :
- Affichage des données chargées
- Test des actions de rechargement
- Vérification des états de chargement
- Gestion des erreurs

Pour utiliser le testeur, l'importer temporairement dans un composant.

## Évolutivité

Le système est conçu pour être facilement extensible :

- Ajout de nouveaux types de données dans le reducer
- Création de nouveaux hooks personnalisés
- Extension des métriques dérivées
- Intégration de nouvelles sources de données

Cette architecture offre une base solide pour la gestion d'état dans l'application SportSee, avec une séparation claire des responsabilités et des performances optimisées.