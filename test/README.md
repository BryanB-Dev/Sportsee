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
    
    1. **Équipement de base** :
       - Choisis des chaussures de running adaptées à ta foulée. Un conseil en magasin spécialisé peut t'aider.
       - Porte des vêtements confortables et respirants.
    
    2. **Programme débutant** :
       - Commence par des séances de **marche rapide** pour t'habituer à l'effort.
       - Alterne marche et course (ex : 1 min de course, 2 min de marche) pendant 20-30 min.
       - Augmente progressivement la durée de course et réduis les phases de marche.
    
    3. **Échauffement et récupération** :
       - Fais un échauffement dynamique (mobilisations articulaires, montées de genoux) avant chaque séance.
       - Étire-toi après la course pour favoriser la récupération.
    
    4. **Écoute ton corps** :
       - Ne force pas sur les douleurs. La progression doit être graduelle.
       - Hydrate-toi bien avant, pendant et après l'effort.
    
    Tu peux commencer par 2 à 3 séances par semaine et ajuster en fonction de ton ressenti. Bonne chance et amuse-toi bien !
  - Status : valid

- **TEST 1.2 - Gestion douleur**
  - Question : J'ai mal aux genoux apres avoir couru hier
  - Réponse :

    Je suis désolé d'apprendre que tu as mal aux genoux après ta séance de course. Voici quelques conseils pour t'aider à récupérer et prévenir les douleurs futures :
    
    1. **Repos et glace** : Prends un jour ou deux de repos pour permettre à tes genoux de récupérer. Applique de la glace sur les zones douloureuses pendant 15-20 minutes, 2-3 fois par jour.
    
    2. **Étirements et renforcement** : Intègre des étirements doux pour les quadriceps et les ischio-jambiers. Renforce aussi tes muscles autour des genoux, comme les quadriceps et les muscles du mollet, avec des exercices comme les squats sans charge ou les fentes statiques.
    
    3. **Analyse de ta technique de course** : Parfois, une mauvaise posture ou une technique de course inefficace peut causer des douleurs aux genoux. Pense à consulter un coach ou un kinésithérapeute pour un bilan technique.
    
    4. **Équipement approprié** : Assure-toi que tes chaussures de course sont adaptées à ton type de pied et à ton style de course. Des chaussures usées ou inadaptées peuvent aggraver les douleurs.
    
    Si la douleur persiste, il est important de consulter un professionnel de santé pour un diagnostic précis. En attendant, écoute ton corps et adapte ton entraînement en conséquence. Bon rétablissement !
  - Status : valid

- **TEST 1.3 - Nutrition basique**
  - Question : Quoi manger apres une seance ?
  - Réponse :

    Après une séance, il est important de privilégier un repas équilibré pour favoriser la récupération musculaire et énergétique. Voici quelques conseils :
    
    - **Protéines** : Consomme des protéines pour réparer les muscles. Exemples : poulet, poisson, œufs, tofu, ou légumineuses.
    - **Glucides complexes** : Réapprovisionne tes réserves d'énergie avec des glucides comme le riz complet, les patates douces, ou les pâtes complètes.
    - **Fruits et légumes** : Pour les vitamines et minéraux. Une banane, par exemple, est riche en potassium, utile pour les crampes.
    - **Hydratation** : Bois de l'eau pour compenser les pertes en sueur.
    
    Un exemple de repas post-séance pourrait être un bol de riz complet avec du poulet grillé et des légumes vapeur, accompagné d'une banane.
    
    Continue comme ça, et n'oublie pas de bien t'hydrater tout au long de la journée !
  - Status : valid

- **TEST 2.1 - Optimisation performance**
  - Question : Ma FC max reste a 185 bpm. Comment l'augmenter ?
  - Réponse :

    Pour augmenter ta fréquence cardiaque maximale (FC max), il faut travailler sur ton endurance cardio et ta puissance aérobie. Voici quelques conseils pour y parvenir :
    
    1. **Entraînement par intervalles à haute intensité (HIIT)** :
       - Intègre des séances de HIIT 1 à 2 fois par semaine.
       - Alterne des phases d'effort intense (proche de ta FC max actuelle) et des phases de récupération active.
       - Exemple : 30 secondes d'effort intense suivi de 1 minute de récupération, répété 8 à 10 fois.
    
    2. **Augmente progressivement l'intensité** :
       - Commence par des séances à 85-90% de ta FC max et augmente progressivement.
       - Utilise un cardiofréquencemètre pour surveiller tes efforts.
    
    3. **Travaille ton endurance fondamentale** :
       - Ajoute des séances d'endurance à intensité modérée (60-70% de ta FC max) pour améliorer ta base aérobie.
       - Par exemple, des sorties longues en course à pied, vélo ou natation.
    
    4. **Renforce ton système cardiovasculaire** :
       - Intègre des exercices de musculation et de renforcement pour améliorer ta condition physique globale.
    
    5. **Récupération et nutrition** :
       - Assure-toi de bien récupérer entre les séances intenses.
       - Mange équilibré et hydrate-toi correctement pour soutenir tes efforts.
    
    Continue à surveiller ta progression et ajuste tes entraînements en fonction de tes ressentis et de tes résultats. Bonne chance !
  - Status : valid

- **TEST 2.2 - Fatigue cumulee**
  - Question : Je suis fatigue depuis 2 semaines malgre mon repos. Que faire ?
  - Réponse :

    Je comprends que tu traverses une période difficile avec cette fatigue persistante. Voici quelques pistes pour t'aider à retrouver ton énergie :
    
    1. **Évalue ton sommeil** : Assure-toi de dormir suffisamment (7-9h par nuit) et de maintenir une routine de sommeil régulière. La qualité du sommeil est aussi importante que la quantité.
    
    2. **Hydratation et alimentation** : Bois suffisamment d'eau et assure-toi d'avoir une alimentation équilibrée, riche en nutriments essentiels. Les carences peuvent parfois causer de la fatigue.
    
    3. **Gestion du stress** : Le stress chronique peut épuiser ton énergie. Pratique des techniques de relaxation comme la méditation, le yoga ou des exercices de respiration profonde.
    
    4. **Activité physique adaptée** : Si tu es actif, assure-toi de ne pas surentraîner. Parfois, une réduction temporaire de l'intensité ou de la durée des séances peut aider à récupérer.
    
    5. **Consultation médicale** : Si la fatigue persiste malgré ces ajustements, il est important de consulter un professionnel de santé pour écarter toute cause médicale sous-jacente.
    
    N'oublie pas que la récupération est une partie essentielle de la performance. Écoute ton corps et n'hésite pas à prendre du temps pour toi. Tu peux y arriver !
  - Status : valid

- **TEST 2.3 - Ambiguite**
  - Question : Mon app dit que j'ai recupere, mais je sens pas ?
  - Réponse :

    Je comprends que ton application indique une bonne récupération, mais que tu ne te sens pas tout à fait au top. C'est important d'écouter ton corps. Voici quelques pistes pour y voir plus clair :
    
    1. **Vérifie les signaux physiques** :
       - As-tu des courbatures persistantes ?
       - Ton sommeil est-il réparateur ?
       - As-tu des sensations de fatigue anormale ?
    
    2. **Analyse ton activité récente** :
       - As-tu augmenté ton volume d'entraînement récemment ?
       - As-tu bien respecté tes temps de repos entre les séances ?
    
    3. **Écoute ton ressenti** :
       - Parfois, la récupération est subjective. Si tu ne te sens pas prêt, c'est important de l'accepter.
    
    Si tu veux, on peut regarder ensemble comment adapter ton programme pour mieux aligner ton ressenti avec les données de l'application. Qu'en penses-tu ?
  - Status : valid

- **TEST 3.1 - Optimisation avancee**
  - Question : Je veux ameliorer mon seuil anaerobique pour mon prochain trail
  - Réponse :

    Super, améliorer ton seuil anaérobie est un excellent objectif pour progresser en trail ! Voici quelques pistes pour y parvenir :
    
    1. **Entraînements fractionnés** : Intègre des séances de fractionné en côte ou en plat. Par exemple, des répétitions de 30 secondes à 1 minute à une intensité élevée (90-95% de ta FC max) avec des récupérations actives.
    
    2. **Travail en seuil** : Des séances à allure seuil (environ 85-90% de ta FC max) pendant 20 à 40 minutes peuvent aider à améliorer ta capacité à maintenir une intensité élevée.
    
    3. **Renforcement musculaire** : Travaille ton renforcement musculaire, notamment les jambes et le tronc, pour améliorer ta stabilité et ton efficacité de course.
    
    4. **Récupération active** : Assure-toi de bien récupérer entre les séances intenses pour permettre à ton corps de s'adapter.
    
    N'hésite pas à me donner plus de détails sur ton entraînement actuel pour que je puisse t'aider plus précisément !
  - Status : valid

- **TEST 3.2 - Question specialisee**
  - Question : Mon ratio aerobie/anaerobique devrait etre ?
  - Réponse :

    Le ratio aérobie/anaérobie idéal dépend de ton niveau, de tes objectifs et de ta discipline. En général, pour un athlète bien entraîné, un ratio de 80/20 (80% aérobie, 20% anaérobie) est souvent recommandé pour optimiser la performance et la récupération.
    
    ### Conseils pour améliorer ton ratio :
    1. **Augmente ton volume aérobie** : Intègre des séances de fond à intensité modérée (60-70% de ta FC max) pour renforcer ton endurance de base.
    2. **Travaille ton seuil anaérobie** : Ajoute des intervalles courts et intenses (ex : 30/30, 1 min/1 min) pour améliorer ta capacité anaérobie.
    3. **Écoute ton corps** : Alterne les séances pour éviter le surentraînement et favoriser la récupération.
    
    Si tu veux des conseils plus précis, partage ton niveau actuel et tes objectifs spécifiques.
  - Status : valid

- **TEST L1 - Donnees manquantes**
  - Question : Pourquoi je progresse pas ? Je n'ai pas de données d'activité.
  - Réponse :

    Je comprends ta frustration. Sans données d'activité, il est difficile d'identifier des points précis à améliorer. Voici quelques pistes générales pour t'aider à progresser :
    
    1. **Évalue ton entraînement actuel** :
       - Es-tu régulier dans ta pratique ?
       - As-tu des objectifs clairs et mesurables ?
    
    2. **Vérifie ta récupération** :
       - Dors-tu suffisamment ?
       - Prends-tu des jours de repos ?
    
    3. **Analyse ton alimentation** :
       - Manges-tu suffisamment pour soutenir ton effort ?
       - As-tu un apport en nutriments équilibré ?
    
    Si tu peux me donner plus de détails sur ton entraînement, je pourrai t'aider de manière plus précise. Continue à avancer, et n'hésite pas à me poser d'autres questions !
  - Status : valid

- **TEST L2 - Hors sujet**
  - Question : Donne-moi des conseils pour mes relations amoureuses.
  - Réponse :

    Désolé, je suis un coach sportif IA spécialisé dans l'entraînement, la nutrition et la récupération. Comment puis-je t'aider avec tes objectifs sportifs ?
  - Status : valid

- **TEST L3 - Question medicale**
  - Question : Je prends un medicament, ca affecte ma perf ?
  - Réponse :

    Désolé, je suis un coach sportif IA spécialisé dans l'entraînement, la nutrition et la récupération. Pour des questions sur les médicaments et leur impact sur ta performance, je te conseille de consulter un professionnel de santé. Comment puis-je t'aider avec tes objectifs sportifs ?
  - Status : valid

- **TEST L4 - Refus diagnostic**
  - Question : J'ai une douleur vive a la hanche depuis 3 jours
  - Réponse :

    Je suis désolé d'apprendre que tu as une douleur à la hanche. En tant que coach sportif, je ne peux pas évaluer ou diagnostiquer des douleurs. Je te conseille de consulter un professionnel de santé (médecin, kinésithérapeute) pour un avis médical personnalisé.
    
    En attendant, tu peux :
    - **Repos** : Éviter les activités qui sollicitent la hanche.
    - **Glace** : Appliquer de la glace sur la zone douloureuse pendant 15-20 minutes, 2-3 fois par jour.
    - **Hydratation** : Boire suffisamment d'eau pour favoriser la récupération des tissus.
    
    Prends soin de toi et n'hésite pas à me demander des conseils sur ta reprise sportive une fois que tu auras consulté un professionnel.
  - Status : valid

- **TEST L5 - Requete contradictoire**
  - Question : Je veux etre tres muscle ET faire un marathon le mois prochain
  - Réponse :

    Désolé, mais ces deux objectifs sont incompatibles à court terme. Pour un marathon, il faut privilégier l'endurance, tandis que la prise de muscle demande un entraînement en force. Concentre-toi sur un seul objectif à la fois pour des résultats optimaux.
    
    Si tu veux te préparer pour un marathon, voici quelques conseils :
    - **Augmente progressivement tes distances** en suivant un plan d'entraînement adapté.
    - **Travaille ta récupération** avec des étirements et des séances de faible intensité.
    - **Adapte ton alimentation** pour soutenir tes efforts (glucides complexes, protéines, hydratation).
    
    Si tu préfères te concentrer sur la musculation, voici quelques pistes :
    - **Suis un programme de musculation** avec des exercices de base (squats, développés couchés, etc.).
    - **Mange suffisamment de protéines** pour soutenir la croissance musculaire.
    - **Assure-toi de bien récupérer** entre les séances pour éviter les blessures.
    
    Choisis l'objectif qui te motive le plus et concentre-toi dessus pour le moment.
  - Status : valid

- **TEST C1 - Ton motivant**
  - Question : J'ai fait une belle seance aujourd'hui !
  - Réponse :

    Super nouvelle ! Je vois que tu as fait 4 séances cette semaine. Tu as parcouru un total de **22.1 km** en **145 minutes** d'activité. Tes BPM varient entre **138 et 183**, avec une moyenne autour de **165**.
    
    Pour continuer sur cette lancée :
    - **Hydratation** : Bois suffisamment d'eau, surtout après des séances intenses.
    - **Récupération** : Étire-toi pour éviter les courbatures.
    - **Nutrition** : Pense à un repas riche en protéines pour aider à la récupération musculaire.
    
    Continue comme ça, tu progresses bien ! 🚀
  - Status : valid

- **TEST C2 - Pas d'emojis**
  - Question : Quel exercice recommandes-tu ? Réponds sans utiliser d'emojis.
  - Réponse :

    Pour te recommander un exercice adapté, j'aurais besoin de plus d'informations. Peux-tu me préciser :
    - Ton objectif principal (perte de poids, prise de muscle, endurance, etc.) ?
    - Le type d'exercice que tu préfères (cardio, musculation, HIIT, etc.) ?
    - Ton niveau actuel (débutant, intermédiaire, avancé) ?
    
    Avec ces détails, je pourrai te proposer un exercice sur mesure.
  - Status : valid

**Résultats actuels**

- **Total tests**: 15
- **Valides**: 15
- **Invalides**: 0
