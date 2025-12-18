# SportSee 🏃‍♂️📊

SportSee est une application Next.js qui regroupe un tableau de bord d'analytics sportifs (distances, durées, BPM, performances) et un coach IA accessible via un chat. L'IA s'exécute côté serveur (`/api/chat`) et utilise l'API Mistral avec des prompts structurés et des validations locales pour garantir des réponses fiables.

![SportSee](./public/background.png)

## 🚀 Fonctionnalités

### 📊 Tableau de bord
- Visualisation des activités : distances, durées, BPM
- Graphiques interactifs (barres, radar) (Recharts)
- Filtrage par période et synthèse hebdomadaire

### 💬 Coach IA (Chat)
- Chat conversationnel avec prompts adaptés par profil (débutant / intermédiaire / expert)

## 📌 À propos

Application de suivi sportif et tableau de bord analytics développée avec Next.js. Ce dépôt contient l'application frontend.

## ✅ Fonctionnalités principales

- Authentification : connexion avec les identifiants fournis par le backend, token stocké sécuritairement 
- Dashboard : graphiques Recharts (activités, sessions, performances)
- Mocks : données mockées disponibles pour développement sans backend
- API : service dédié pour appels à l'API
- Chat IA : interface conversationnelle et endpoint `/api/chat` côté Next.js

## 🧰 Technologies

- Next.js — App Router
- React (hooks, Context API)
- Recharts — visualisations graphiques
- Node.js (backend fourni)
- CSS Modules / globals CSS

## ⚙️ Installation & démarrage

1. Cloner le repository :

```bash
git clone <votre-repo>
cd sportsee
```

2. Installer les dépendances frontend :

```bash
npm install
```

3. Lancer le frontend :

```bash
npm run dev
```

Accéder à l'app : http://localhost:3000

Notes : adaptez les ports si nécessaire. Stockez la clé API IA dans une variable d'environnement lorsque vous activez les features IA.

## 🗂️ Structure du projet

```
sportsee/
├── public/
├── src/
│   ├── app/                # pages App Router (layout, routes)
│   ├── components/         # UI & charts
│   ├── config/             # routes, prompts, dataSource
│   ├── contexts/           # AuthContext, DataContext
│   ├── hooks/              # useAppData, hooks API
│   ├── mocks/              # données mock pour dev
│   └── services/           # apiService, chatService
├── package.json
└── README.md
```
```
backend/
├── app/
│   ├── routes.js           # endpoints mock / auth
│   └── data.json           # utilisateurs & données
├── package.json
└── README.md
```

## 🔌 API & données

- Le backend fourni expose des endpoints pour l'authentification et la récupération des données utilisateur. Pendant le développement, l'application utilise principalement les mocks disponibles dans `src/mocks/apiData.js`.

- Ce fichier exporte les données et fonctions suivantes (à utiliser pour le développement local) :

  - `mockAuthUsers` : tableau d'utilisateurs mockés pour l'authentification. Chaque entrée contient `username`, `password`, `userId` et `token`.
  - `mockLoginResponse` : objet renvoyé lors d'un login mock (`{ token, userId }`).
  - `mockUserInfo` : objet mappant `userId` → `{ profile, statistics }`.
  - `mockUserActivity` : objet mappant `userId` → tableau de sessions d'activité (date, distance, duration, heartRate, caloriesBurned).
  - `mockApiCall(data, delay)` : utilitaire qui renvoie une Promise simulant un délai réseau.
  - `mockLogin(username, password)` : simule l'authentification et renvoie `{ token, userId }`.
  - `mockGetUserInfo(userId)` : renvoie les informations profil/statistiques pour le `userId`.
  - `mockGetUserActivity(userId, startWeek, endWeek)` : renvoie la liste d'activités filtrée par date si demandé.

  Exemple (extrait simplifié du fichier `src/mocks/apiData.js`) :

  ```javascript
  export const mockAuthUsers = [
    { username: 'sophiemartin', password: 'password123', userId: 'user123', token: '...'},
    { username: 'emmaleroy',    password: 'password789', userId: 'user456', token: '...'}
  ];

  export const mockLoginResponse = { token: '...', userId: 'user123' };

  export const mockUserInfo = {
    'user123': {
      profile: { firstName: 'Sophie', lastName: 'Martin', age: 32, ... },
      statistics: { totalDistance: '2250.2', totalSessions: 348, totalDuration: 14625 }
    }
  };

  export const mockUserActivity = {
    'user123': [ { date: '2025-11-18', distance: 5.8, duration: 38, heartRate: {...}, caloriesBurned: 422 }, ... ]
  };
  ```

- Utilisation recommandée : importez les fonctions de `src/mocks/apiData.js` dans vos hooks ou services pendant le développement (par exemple pour `useAuth` ou `useAppData`). Quand vous passez au backend réel, remplacez les appels mock par les appels au service HTTP (`apiService`).


## 🤖 Intégration IA

- Configurez la clé API Mistral via une variable d'environnement pour activer les fonctionnalités IA.
- L'endpoint serveur Next.js `/api/chat` est déjà implémenté : il reçoit le message, sanitise l'entrée, appelle l'API IA et renvoie la réponse formatée.
- Le code inclut des protections pour limiter la taille des prompts, gérer les timeouts/erreurs et éviter de logger des données sensibles.

## 🧪 Tests & validation

- Le fichier `test_results.json` contient une suite de prompts et leurs réponses pour valider le comportement du chatbot/IA.

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Commitez vos changements (`git commit -m 'Add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est développé dans le cadre de la formation OpenClassrooms - Développeur IA.

---

**Développé avec ❤️ par [BryanB-Dev](https://github.com/BryanB-Dev)**
