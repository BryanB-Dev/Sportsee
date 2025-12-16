# Résumé du Coach IA

Ce document synthétise le prompt structuré, les contraintes métier et les validations réalisées pour garantir un coach IA conforme aux critères SportSee.

## Cadre métier
- **Domaines centraux** : entraînement, nutrition, récupération, performance, motivation.
- **Canal** : `ChatAIModal` envoie les messages à `/api/chat` (route Next.js) qui enrichit les échanges avec `coachAIPrompt` puis transmet à Mistral.
- **Données disponibles** : 7 dernières activités, tendances (progression/stable/baisse), profil (calories, macronutriments), statistiques nutritionnelles et score de récupération.

## Instructions clés du prompt
1. Persona bienveillante, motivante et professionnelle ; français clair, sans emojis.
2. Marquer immédiatement le contexte (effort, progrès, défi) et proposer 2-3 actions concrètes.
3. Conclure avec un encouragement ou une question de suivi (ex. : "Continue comme ça !", "Qu'est-ce que tu veux travailler cette semaine ?").
4. Refuser systématiquement : hors sujet (politique, relations, culture...), demandes médicales/diagnostics/pharmaceutiques et demandes d'images.
5. Adapter la réponse au profil : débutant (progression douce, mentionner "semaine", "débuter"), intermédiaire (optimisation), expert (langage technique, seuils, lactate).
6. Inclure des mots-clés selon la situation : nutrition post-séance = protéines + glucides + hydratation + timing, douleurs = repos + professionnel, plateau = frustration + pistes + explorer.

## Tests automatisés (15 scénarios)
- Profils : débutant, intermédiaire, expert.
- Domaines : initiation, douleur, nutrition, optimisation cardio, fatigue, ambiguïté, plateau, seuil anaérobie, ratio aérobie/anaérobie, hors sujet, médical, diagnostic, contradiction, reconnaissance.
- Taux de réussite actuel : 14 réponses conformes sur 15 ; le refus hors-sujet est identifiée comme point d'attention (voir `COACH_AI_TEST_RESULTS.md`).

## Bonnes pratiques
- Toujours appeler `buildMessagesWithSystem(messages)` avant d'envoyer la requête à Mistral.
- Stocker `MISTRAL_API_KEY` uniquement côté serveur (`.env.local`).
- Documenter vos exemples dans `COACH_AI_TEST_RESULTS.md`.
- Tester régulièrement la modal chat avec des questions hors sujet/médicales.

## Points de surveillance
- S'assurer que les prompts suivent les évolutions de la maquette (graphes, nouveaux objectifs).
- Vérifier la gestion des timeouts et rate limits dans `src/app/api/chat/route.js`.
- Confirmer que les contextes (`DataContext`, `AuthContext`) transmettent les données nécessaires au prompt.
