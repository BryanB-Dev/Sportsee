# Documentation des Mocks SportSee

## 📋 Vue d'ensemble

Ce dossier contient les données mockées pour le développement de l'application SportSee. Les mocks sont basés sur la structure réelle de l'API backend disponible sur `http://localhost:8000`.

## 🏗️ Structure des fichiers

```
src/mocks/
├── apiData.js          # Données mockées de l'API
├── testMocks.js        # Tests et validation des mocks
└── README.md          # Cette documentation

src/services/
└── apiService.js      # Service API avec basculement mock/réel

src/utils/
└── dataTransformers.js # Transformations pour les graphiques
```

## 🔌 API Backend

### Endpoints disponibles

#### 1. Authentification
```bash
POST /api/login
Content-Type: application/json

{
  "username": "sophiemartin",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "token": "jwt-token",
  "userId": "user123"
}
```

#### 2. Informations utilisateur
```bash
GET /api/user-info
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "profile": {
    "firstName": "Sophie",
    "lastName": "Martin", 
    "age": 32,
    "weight": 60,
    "height": 165,
    "profilePicture": "http://localhost:8000/images/sophie.jpg",
    "createdAt": "2025-01-01"
  },
  "statistics": {
    "totalDistance": "156.2",
    "totalSessions": 35,
    "totalDuration": 1245
  }
}
```

#### 3. Activité utilisateur
```bash
GET /api/user-activity?startWeek=2025-11-18&endWeek=2025-11-24
Authorization: Bearer <token>
```

**Réponse:**
```json
[
  {
    "date": "2025-11-18",
    "distance": 5.8,
    "duration": 38,
    "heartRate": {
      "min": 140,
      "max": 178, 
      "average": 163
    },
    "caloriesBurned": 422
  }
]
```

## 👥 Utilisateurs de test

| Username | Password | User ID | Nom |
|----------|----------|---------|-----|
| sophiemartin | password123 | user123 | Sophie Martin |
| emmaleroy | password789 | user456 | Emma Leroy |
| marcdubois | password456 | user789 | Marc Dubois |

## 📊 Transformation des données

### Pour graphiques Recharts

#### 1. Graphique en barres (activité quotidienne)
```javascript
// Distance et calories par jour
const barData = transformActivityForBarChart(activityData);
// Format: [{ day: 1, date: "2025-11-18", distance: 5.8, calories: 422 }]
```

#### 2. Graphique linéaire (sessions moyennes)
```javascript
// Durée moyenne par jour de la semaine
const lineData = transformActivityForLineChart(activityData);
// Format: [{ day: 1, dayName: "L", sessionLength: 38 }]
```

#### 3. Graphique radar (performances)
```javascript
// 6 métriques de performance
const radarData = transformActivityForRadarChart(activityData, profile);
// Format: [{ subject: "Intensité", A: 82, fullMark: 100 }]
```

#### 4. Score de progression
```javascript
// Progression vers objectif hebdomadaire
const score = calculateWeeklyGoalProgress(activityData, weeklyGoal);
// Format: 0.75 (75% de l'objectif atteint)
```

## 🔧 Utilisation

### Mode développement (avec mocks)
```javascript
import apiService from '../services/apiService.js';

// Les mocks sont activés par défaut
const userInfo = await apiService.user.getUserInfo(token);
```

### Basculement vers API réelle
```javascript
// Dans apiService.js, changer:
const USE_MOCK_DATA = false; // true par défaut
```

### Test des mocks
```javascript
import { testMocks } from '../mocks/testMocks.js';

// Valider que tout fonctionne
await testMocks();
```

## ⚠️ Points de vigilance

1. **Cohérence des données**: Les mocks respectent exactement la structure de l'API réelle
2. **Authentification**: Les tokens mockés sont préfixés par `mock-jwt-token-`
3. **Dates**: Utiliser des dates récentes pour les tests (semaine courante)
4. **Performances**: Les calculs radar sont approximatifs pour la démonstration
5. **Macronutriments**: Les estimations sont basées sur l'activité et le profil

## 🚀 Développement

### Ajouter un nouvel utilisateur
1. Ajouter dans `mockAuthUsers`
2. Créer les données dans `mockUserInfo` 
3. Ajouter l'activité dans `mockUserActivity`

### Ajouter de nouvelles métriques
1. Modifier `calculateKeyStats()` dans `dataTransformers.js`
2. Adapter les transformations radar si nécessaire
3. Mettre à jour les tests dans `testMocks.js`

### Débogage
```javascript
// Activer les logs dans apiService.js
console.log('API Response:', data);

// Tester individuellement
import { showDataOverview, validateDataConsistency } from '../mocks/testMocks.js';
showDataOverview();
validateDataConsistency();
```

## 📈 Métriques calculées

### Graphique radar
- **Intensité**: Basée sur la fréquence cardiaque moyenne
- **Vitesse**: Calculée à partir du rythme (min/km)
- **Force**: Distance maximale parcourue
- **Endurance**: Distance totale cumulée
- **Energie**: Durée totale d'activité
- **Cardio**: Consistance (% de jours actifs)

### Statistiques clés  
- **Calories**: Total des calories brûlées
- **Protéines**: Estimation basée sur le poids (1.5g/kg)
- **Glucides**: Estimation basée sur la distance (30g/km)
- **Lipides**: 25% des calories en graisse

## 🔄 Workflow de développement

1. **Développer avec mocks** (`USE_MOCK_DATA = true`)
2. **Tester la logique métier** avec des données cohérentes
3. **Valider les transformations** pour les graphiques
4. **Basculer vers l'API réelle** (`USE_MOCK_DATA = false`)
5. **Tester l'intégration** avec le backend

Cette approche permet un développement rapide et fiable, avec une transition transparente vers les données réelles.