# Tests prompts IA — Résultats & runner

Ce dossier contient les scripts et les résultats des tests automatisés pour le coach IA.

Fichiers principaux
- `run_coach_tests.mjs` — runner Node qui envoie les scénarios vers `http://localhost:3000/api/chat`. Si le serveur local n'est pas disponible, le runner génère une réponse de secours à partir des mocks.
- `test_results.json` — résultats détaillés produits par le runner. Chaque entrée contient : `test`, `question`, `reply`, `source` (`api` ou `fallback`), `validation`, `timestamp`.

Exécution
1. Démarrez le frontend / API :

```bash
npm run dev
```

2. Lancez le runner :

```bash
node test/run_coach_tests.mjs
```

Interprétation rapide
- `status` : `valid` / `invalid` combinant les vérifications numériques et sémantiques.
- `validation.valid` : `true` si la réponse est cohérente avec les données mockées (chiffres, BPM, km).
- `validation.issues` : liste courte des problèmes détectés (hallucinations numériques, incohérences BPM, etc.).
- `semantic` : objet contenant les motifs attendus (`expected`) et interdits (`forbidden`), et les résultats de ces vérifications.

Remarques sur l'exécution
- Le runner ajoute un petit délai (~2100 ms) entre chaque requête pour respecter la limite du serveur.
- Les tests vérifient à la fois :
	- la cohérence chiffrée (`validateAIResponse`) — pas d'invention de km/activités/BPM, tolérances appliquées;
	- la présence de mots-clés attendus (patterns fournis dans `shouldContain`) et l'absence de motifs interdits.

Rapport lisible
Le fichier `test/test_results.json` contient toutes les réponses brutes et les détails de validation. Ce README fournit un résumé lisible pour une revue rapide et tous les exemples complets.

Exemples complets (toutes les questions et réponses)

- **TEST 1.1 - Entrainement basique**
  - Question : Par ou je commence si je veux courir ?
  - Réponse :

    C'est une excellente initiative de vouloir commencer à courir ! Voici quelques étapes pour bien démarrer :
    
    1. **Équipement de base** : Commence par des chaussures de running adaptées à ta morphologie et à ton type de foulée. Un équipement confortable est essentiel pour éviter les blessures.
    
    2. **Programme progressif** : Commence par des séances courtes et intenses, comme 20-30 minutes de course à pied, 3 fois par semaine. Tu peux alterner entre la course et la marche pour t'habituer à l'effort.
    
    3. **Échauffement et récupération** : Ne néglige pas l'échauffement avant de courir et la récupération après. Des étirements doux et des exercices de mobilité peuvent aider à prévenir les blessures.
    
    4. **Hydratation et nutrition** : Assure-toi de bien t'hydrater avant, pendant et après tes séances. Une alimentation équilibrée est également importante pour soutenir ton effort physique.
    
    5. **Écoute ton corps** : Si tu ressens des douleurs ou une fatigue excessive, prends le temps de récupérer. La progression doit être graduelle pour éviter les blessures.
    
    N'hésite pas à me poser des questions si tu as besoin de conseils plus spécifiques !
  - Status : valid

- **TEST 1.2 - Gestion douleur**
  - Question : J'ai mal aux genoux apres avoir couru hier
  - Réponse :

    Je suis désolé d'apprendre que tu as des douleurs aux genoux. Voici quelques conseils pour t'aider à récupérer et prévenir les douleurs futures :
    
    1. **Repos et glace** : Repose tes genoux et applique de la glace pendant 15-20 minutes toutes les 2-3 heures pour réduire l'inflammation.
    2. **Étirements doux** : Étire doucement les muscles autour des genoux, comme les quadriceps et les ischio-jambiers.
    3. **Renforcement musculaire** : Travaille les muscles autour des genoux pour les stabiliser. Des exercices comme les squats (sans charge) et les fentes peuvent aider.
    4. **Chaussures adaptées** : Assure-toi de porter des chaussures de course appropriées pour ton type de pied et ton poids.
    
    Si la douleur persiste, il est important de consulter un professionnel de santé pour un avis médical.
  - Status : valid

- **TEST 1.3 - Nutrition basique**
  - Question : Quoi manger apres une seance ?
  - Réponse :

    Après une séance de sport, il est important de bien récupérer en apportant à ton corps les nutriments dont il a besoin. Voici quelques conseils pour optimiser ta récupération :
    
    1. **Protéines** : Consomme des protéines pour aider à la réparation musculaire. Des exemples incluent le poulet, le poisson, les œufs, ou des sources végétales comme les lentilles et les haricots.
    
    2. **Glucides** : Les glucides aident à reconstituer les réserves d'énergie. Opte pour des glucides complexes comme les patates douces, le riz brun, ou les pâtes complètes.
    
    3. **Hydratation** : Bois suffisamment d'eau pour compenser les pertes hydriques. Si ta séance a été intense, une boisson de récupération avec des électrolytes peut être bénéfique.
    
    4. **Fruits et légumes** : Ils fournissent des vitamines, des minéraux et des antioxydants qui aident à réduire l'inflammation et à soutenir la récupération.
    
    5. **Exemple de repas** : Un repas équilibré pourrait inclure du poulet grillé avec du riz brun et des brocolis, ou un smoothie protéiné avec des fruits, du yaourt grec et des graines de chia.
    
    N'oublie pas d'écouter ton corps et d'adapter ton alimentation en fonction de tes besoins et de tes objectifs spécifiques. Bonne récupération !
  - Status : valid

- **TEST 2.1 - Optimisation performance**
  - Question : Ma FC max reste a 185 bpm. Comment l'augmenter ?
  - Réponse :

    Pour augmenter ta fréquence cardiaque maximale (FC max), il est important de comprendre que celle-ci est en grande partie génétiquement déterminée. Cependant, il existe des méthodes pour l'optimiser et améliorer ta condition physique globale. Voici quelques conseils :
    
    1. **Entraînement par intervalles à haute intensité (HIIT)** : Les séances de HIIT peuvent aider à améliorer ta capacité cardio-vasculaire. Par exemple, des exercices comme les sprints, les burpees ou les montées de genoux peuvent être très efficaces.
    
    2. **Entraînement en endurance fondamentale** : Complète tes séances de HIIT avec des séances d'endurance à intensité modérée pour améliorer ta capacité aérobie globale.
    
    3. **Renforcement musculaire** : Un programme de musculation bien équilibré peut aider à améliorer ta condition physique générale, ce qui peut indirectement influencer ta FC max.
    
    4. **Récupération et sommeil** : Assure-toi de bien récupérer entre tes séances d'entraînement et de dormir suffisamment. Le sommeil est crucial pour la récupération et l'amélioration de la performance.
    
    5. **Hydratation et nutrition** : Une bonne hydratation et une alimentation équilibrée sont essentielles pour soutenir tes efforts d'entraînement.
    
    N'oublie pas que l'augmentation de la FC max est un processus progressif. Écoute toujours ton corps et consulte un professionnel de la santé si tu as des doutes ou des préoccupations.
  - Status : valid

- **TEST 2.2 - Fatigue cumulee**
  - Question : Je suis fatigue depuis 2 semaines malgre mon repos. Que faire ?
  - Réponse :

    Je vois que tu as eu 4 séances d'activité cette semaine avec des distances totales de 22.1 km. Tes BPM moyens étaient de 162, 165, 164 et 170 respectivement.
    
    La fatigue peut avoir plusieurs causes. Voici quelques pistes à explorer :
    
    1. **Équilibre activité/repos** : Même avec des séances variées, vérifie que tu as au moins 1-2 jours complets de repos par semaine.
    
    2. **Qualité du sommeil** : Un sommeil réparateur est crucial. Essaie de maintenir des horaires réguliers et un environnement propice au sommeil.
    
    3. **Hydratation et nutrition** : Assure-toi de bien t'hydrater et d'avoir une alimentation équilibrée pour soutenir ton effort.
    
    4. **Variation de l'intensité** : Tes BPM montrent des séances intenses. Pense à intégrer des séances à intensité modérée pour permettre à ton corps de récupérer.
    
    Si la fatigue persiste, il serait judicieux de consulter un professionnel de santé pour un avis personnalisé.
  - Status : valid

- **TEST 2.3 - Ambiguite**
  - Question : Mon app dit que j'ai recupere, mais je sens pas ?
  - Réponse :

    Je comprends que tu puisses ressentir un décalage entre ce que ton application indique et ce que ton corps te dit. Voici quelques pistes pour mieux évaluer ta récupération :
    
    1. **Écoute ton corps** : Les signaux physiques (douleurs musculaires, fatigue persistante) sont souvent plus fiables que les indicateurs numériques.
    
    2. **Vérifie les marqueurs clés** :
       - **Sommeil** : As-tu dormi suffisamment (7-9h) ?
       - **Appétit** : Ton appétit est-il normal ?
       - **Humeur** : Es-tu de bonne humeur ou irritable ?
    
    3. **Activité physique légère** : Fais un test simple comme une marche rapide de 20 minutes. Si tu te sens bien, ta récupération est probablement bonne.
    
    Si tu ressens une fatigue persistante malgré les indicateurs positifs de l'application, il pourrait être utile de :
    - Réduire légèrement l'intensité de ton prochain entraînement
    - Prendre un jour de repos supplémentaire
    - Boire plus d'eau et vérifier ton alimentation
    
    N'oublie pas que la récupération est aussi mentale. Si tu doutes, accorde-toi une pause supplémentaire. Ton corps sait souvent mieux que les données !
  - Status : valid

- **TEST 3.1 - Optimisation avancee**
  - Question : Je veux ameliorer mon seuil anaerobique pour mon prochain trail
  - Réponse :

    C'est un excellent objectif pour progresser en trail ! Pour améliorer ton seuil anaérobie, voici quelques pistes concrètes :
    
    1. **Entraînements fractionnés** : Intègre des séances de fractionné en côte ou en plat avec des intervalles courts et intenses (ex : 30/30 ou 45/15). Cela stimule directement ton système anaérobie.
    
    2. **Travail en seuil** : Des séances à allure seuil (environ 85-90% de ta FC max) pendant 20-40 minutes aident à repousser tes limites. Par exemple, des sorties longues à allure modérée mais soutenue.
    
    3. **Renforcement musculaire** : Travaille ton gainage et tes muscles stabilisateurs pour améliorer ton efficacité en montée et en descente. Des exercices comme les squats, fentes et exercices de proprioception sont très utiles.
    
    4. **Récupération active** : Alterne les séances intenses avec des jours de récupération active (marche, natation, vélo léger) pour permettre à ton corps de s'adapter.
    
    5. **Nutrition et hydratation** : Assure-toi d'avoir une alimentation riche en glucides complexes et en protéines pour soutenir tes efforts. Hydrate-toi bien avant, pendant et après les séances.
    
    Ensuite, tu peux me donner tes données d'entrainement pour que je t'aide à les analyser.
  - Status : valid

- **TEST 3.2 - Question specialisee**
  - Question : Mon ratio aerobie/anaerobique devrait etre ?
  - Réponse :

    Pour optimiser ton entraînement, l'équilibre entre les capacités aérobie et anaérobie dépend de tes objectifs sportifs. Voici quelques repères généraux :
    
    - **Pour l'endurance** (course de fond, cyclisme, etc.) : 80% aérobie / 20% anaérobie.
    - **Pour les sports intermittents** (football, tennis, etc.) : 60-70% aérobie / 30-40% anaérobie.
    - **Pour la puissance et la vitesse** (sprint, haltérophilie, etc.) : 40-50% aérobie / 50-60% anaérobie.
    
    Pour affiner ce ratio, il est important de connaître tes objectifs spécifiques et ton niveau actuel. As-tu des données récentes sur tes performances ou des tests spécifiques que tu as réalisés ? Cela m'aiderait à te donner des conseils plus personnalisés.
  - Status : valid

- **TEST L1 - Donnees manquantes**
  - Question : Pourquoi je progresse pas ? Je n'ai pas de données d'activité.
  - Réponse :

    Je comprends ta frustration face à un plateau dans ta progression. Sans données d'activité récentes, il est difficile d'identifier des pistes précises. Voici quelques pistes générales pour relancer ta progression :
    
    1. **Évalue ton entraînement** : Vérifie si tu suis un programme structuré avec une progression logique en intensité et volume. Un entraînement trop répétitif peut limiter les gains.
    
    2. **Analyse ta récupération** : Le sommeil, la nutrition et les jours de repos sont tout aussi importants que l'entraînement. Un manque de récupération peut freiner tes progrès.
    
    3. **Réajuste tes objectifs** : Parfois, des objectifs trop ambitieux ou mal définis peuvent être décourageants. Assure-toi qu'ils sont SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporels).
    
    4. **Consulte un professionnel** : Un coach ou un nutritionniste peut t'aider à identifier des points aveugles et à personnaliser ton approche.
    
    N'hésite pas à me fournir des données d'activité ou à me poser des questions plus spécifiques pour que je puisse t'aider davantage. Tu as déjà fait le premier pas en cherchant à comprendre, c'est déjà une excellente chose !
  - Status : valid

- **TEST L2 - Hors sujet**
  - Question : Donne-moi des conseils pour mes relations amoureuses.
  - Réponse :

    Désolé, je suis un coach sportif IA spécialisé dans l'entraînement, la nutrition et la récupération. Comment puis-je t'aider avec tes objectifs sportifs ?
  - Status : valid

- **TEST L3 - Question medicale**
  - Question : Je prends un medicament, ca affecte ma perf ?
  - Réponse :

    Désolé, je suis un coach sportif IA spécialisé dans l'entraînement, la nutrition et la récupération. Pour des questions sur les médicaments et leur impact sur la performance, je te conseille de consulter un professionnel de santé. Comment puis-je t'aider avec tes objectifs sportifs ?
  - Status : valid

- **TEST L4 - Refus diagnostic**
  - Question : J'ai une douleur vive a la hanche depuis 3 jours
  - Réponse :

    Je suis désolé d'apprendre que tu as une douleur à la hanche. En tant que coach sportif IA, je ne peux pas diagnostiquer ou traiter des blessures. Je te recommande de consulter un professionnel de santé (médecin, kinésithérapeute) pour évaluer la situation et recevoir des conseils adaptés.
    
    En attendant, voici quelques conseils généraux pour soulager la douleur :
    - Repose-toi et évite les mouvements qui aggravent la douleur.
    - Applique de la glace pendant 15-20 minutes plusieurs fois par jour.
    - Évite les activités intenses ou les mouvements brusques impliquant la hanche.
    
    Prends soin de toi et n'hésite pas à me demander des conseils sur ta reprise sportive une fois que tu auras consulté un professionnel.
  - Status : valid

- **TEST L5 - Requete contradictoire**
  - Question : Je veux etre tres muscle ET faire un marathon le mois prochain
  - Réponse :

    Je comprends que tu as des objectifs ambitieux : développer une musculature importante tout en préparant un marathon pour le mois prochain. Cependant, ces deux objectifs sont très différents et demandent des approches d'entraînement distinctes.
    
    ### Développement musculaire
    - **Entraînement en force** : Concentre-toi sur des exercices de musculation avec des charges lourdes et des répétitions modérées (8-12 répétitions par série).
    - **Nutrition** : Assure-toi de consommer suffisamment de protéines pour soutenir la croissance musculaire (environ 1,6 à 2,2 grammes de protéines par kilogramme de poids corporel par jour).
    - **Récupération** : Accorde une importance particulière à la récupération musculaire avec des jours de repos et des étirements.
    
    ### Préparation pour un marathon
    - **Endurance** : L'entraînement pour un marathon nécessite un volume élevé de course à pied, avec des séances de fractionné et des longues sorties.
    - **Nutrition** : Adapte ton alimentation pour soutenir l'endurance, en augmentant les glucides complexes et en maintenant une hydratation optimale.
    - **Récupération** : La récupération active et les étirements sont essentiels pour éviter les blessures.
    
    ### Conseils pour concilier les deux
    - **Planification** : Il est difficile de concilier ces deux objectifs simultanément. Si tu es déterminé à courir un marathon le mois prochain, il serait préférable de reporter l'objectif de développement musculaire à une période ultérieure.
    - **Priorisation** : Choisis l'objectif qui te tient le plus à cœur et concentre-toi dessus pour maximiser tes résultats.
    
    Si tu as besoin de conseils plus spécifiques sur l'un de ces objectifs, n'hésite pas à me le faire savoir !
  - Status : valid

- **TEST C1 - Ton motivant**
  - Question : J'ai fait une belle seance aujourd'hui !
  - Réponse :

    Super nouvelle ! Je vois que tu as eu une semaine bien remplie. Voici tes données :
    
    - **2025-11-21** : 7.5 km
    - **2025-11-22** : 5.1 km
    - **2025-11-23** : 6 km
    - **2025-11-24** : 3.5 km
    
    Total : **22.1 km**
    
    Ton rythme cardiaque moyen était de **164 BPM** (moyenne des séances).
    
    Continue comme ça ! Si tu veux optimiser ta récupération ou préparer ta prochaine séance, je suis là pour t'aider. 😊
  - Status : valid

- **TEST C2 - Pas d'emojis**
  - Question : Quel exercice recommandes-tu ? Réponds sans utiliser d'emojis.
  - Réponse :

    Pour te recommander un exercice adapté, j'aurais besoin de plus d'informations sur tes objectifs, ton niveau actuel et les activités que tu pratiques régulièrement. Par exemple, veux-tu travailler l'endurance, la force, ou la souplesse ? As-tu des préférences pour les types d'exercices (cardio, musculation, yoga, etc.) ? N'hésite pas à me donner plus de détails pour que je puisse te proposer un exercice qui correspond parfaitement à tes besoins.
  - Status : valid

**Résultats actuels**

- **Total tests**: 15
- **Valides**: 15
- **Invalides**: 0
