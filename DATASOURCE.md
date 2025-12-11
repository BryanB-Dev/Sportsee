# Configuration de la source de données - SportSee

## Basculer entre Mock et API Backend

Le projet SportSee permet de basculer facilement entre des données mockées (pour le développement) et l'API backend réelle.

### Configuration rapide

**Fichier à modifier :** `src/config/dataSource.js`

```javascript
// Pour utiliser les données mockées (développement/test)
export const USE_MOCK_DATA = true;

// Pour utiliser l'API backend réelle
export const USE_MOCK_DATA = false;
```

### Détails de configuration

#### Mode Mock (USE_MOCK_DATA = true)
- ✅ Pas besoin de lancer le backend
- ✅ Données de test prédéfinies
- ✅ Développement rapide sans dépendances
- ✅ Idéal pour les tests et le développement frontend

#### Mode API (USE_MOCK_DATA = false)
- ✅ Connexion au backend réel sur `http://localhost:8000`
- ✅ Authentification JWT requise
- ✅ Données dynamiques réelles
- ⚠️ **Nécessite que le backend soit lancé**

### Démarrage du backend

**Prérequis :**
- Node.js (version 12.18 ou supérieure)
- Yarn

**Commandes :**
```bash
cd backend
yarn install
yarn dev
```

Le backend sera accessible sur `http://localhost:8000`

### Utilisateurs de test

Trois utilisateurs sont disponibles pour les tests :

| Username | Password | Description |
|----------|----------|-------------|
| `sophiemartin` | `password123` | Utilisateur 1 |
| `emmaleroy` | `password789` | Utilisateur 2 |
| `marcdubois` | `password456` | Utilisateur 3 |

### Endpoints API

L'API backend expose les endpoints suivants :

#### Authentification
- `POST /login` - Authentification et obtention du JWT token

#### Données utilisateur (nécessite authentification)
- `GET /api/user-info` - Informations profil, statistiques et objectifs
- `GET /api/user-activity?startWeek=<date>&endWeek=<date>` - Sessions d'activité
- `GET /api/profile-image` - Image de profil
- `GET /uploads/<filename>` - Accès aux images uploadées

### Architecture du projet

```
sportsee/
├── src/
│   ├── config/
│   │   └── dataSource.js       ← Configuration centralisée (MODIFIER ICI)
│   ├── services/
│   │   └── apiService.js       ← Service API (utilise dataSource.js)
│   ├── mocks/
│   │   └── apiData.js          ← Données mockées
│   └── ...
```

### Exemple d'utilisation dans les composants

Les composants n'ont **pas besoin d'être modifiés** ! Ils utilisent automatiquement la configuration définie dans `dataSource.js`.

```javascript
// Les composants utilisent toujours le même code
import { authService, userService } from '../services/apiService';

// Ces appels utilisent automatiquement le mock ou l'API selon la config
const result = await authService.login(username, password);
const userInfo = await userService.getUserInfo(token);
```

### Dépannage

**Problème : Erreurs de connexion en mode API**
- ✅ Vérifier que le backend est lancé (`yarn dev` dans le dossier backend)
- ✅ Vérifier que le backend est accessible sur `http://localhost:8000`
- ✅ Vérifier les credentials de connexion

**Problème : Token invalide**
- ✅ Se reconnecter pour obtenir un nouveau token JWT
- ✅ Vérifier que le token n'est pas expiré

**Retour rapide au mode Mock**
- ✅ Mettre `USE_MOCK_DATA = true` dans `src/config/dataSource.js`
- ✅ Recharger la page
