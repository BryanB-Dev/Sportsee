# Mocks de l'API SportSee

Ce dossier fournit les données fictives nécessaires pour développer le frontend sans lancer le backend SportSee.

## Contenu principal
- `apiData.js` : exports des payloads (activités, statistiques, sessions, utilisateur, chat) et utilitaires pour simuler les réponses de l'API.

## Comment l'utiliser
1. Ouvrez `src/config/dataSource.js` et sélectionnez la source `mock` (au lieu de `api`).
2. Lancez `npm run dev` dans le frontend : `apiService` absorbe les données de `src/mocks/apiData.js` et les composants fonctionnent seuls.
3. Pour repasser à l’API réelle, redéfinissez `dataSource` sur `api` et démarrez le backend (`backend/`).

## Pourquoi garder ces mocks
- Permettent de développer les graphiques même si le backend est arrêté.
- Simplifient les tests rapides (unitaires, UI) sans dépendre d’une API externe.
- Servent de référence pour construire les prompts IA (structures attendues par le chat).
- apiData.js : données mockées et fonctions de simulation d'API
