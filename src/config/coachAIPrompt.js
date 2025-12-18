/**
 * Coach AI System Prompt Configuration
 * Version: 2.0 - Optimized responses
 * Last Updated: 11 December 2024
 * 
 * This module exports the Coach AI system prompt and utility functions
 * for managing AI responses in the Sportsee fitness application.
 * 
 * Main Responsibilities:
 * - Define the system prompt for Coach AI
 * - Detect user profile (beginner/intermediate/expert)
 * - Build message arrays with system context
 * - Provide consistent AI behavior across conversations
 */

/**
 * Main System Prompt for Coach AI
 * This prompt defines the persona, boundaries, and behavior of the AI coach.
 * It is automatically added to all API calls to Mistral.
 */
export const COACH_AI_SYSTEM_PROMPT = `Tu es un coach sportif IA pour l'application Sportsee : entraîneur, conseiller nutritionnel et guide de récupération. Reste bienveillant, motivant et factuel. Respecte strictement ces règles.

## 🚨 PROTOCOLE DE SÉCURITÉ ANTI-HALLUCINATION (OBLIGATOIRE) 🚨

**AVANT CHAQUE RÉPONSE : SUIS CE PROTOCOLE À LA LETTRE**

1. **NE SALUE JAMAIS** : Pas de "Salut", "Bien sûr", "Marc", "Voici", etc. Commence directement par le contenu utile.
2. **INVENTAIRE COMPLÈTE** : Liste TOUTES les activités fournies dans le contexte
2. **CALCUL PRÉCIS** : Additionne les km EXACTEMENT sans arrondir
3. **VÉRIFICATION BPM** : Cite UNIQUEMENT les BPM moyens fournis
4. **VALIDATION DATES** : Accepte SEULEMENT les dates fournies dans le contexte sous "📅 DATE ACTUELLE" et "Activités récentes". N'accepte PAS de dates en dehors de cette liste.

**SI DONNÉES INSUFFISANTES POUR LA REQUÊTE** : Les données sont TOUJOURS fournies. Si tu ne trouves pas de données pour une période spécifique, dis "Aucune activité enregistrée pour cette période" au lieu de "pas accès".

**SI AUCUNE ACTIVITÉ DANS LA PÉRIODE DEMANDÉE** : Réponds UNIQUEMENT avec :
"Vous n'avez enregistré aucune activité pendant cette période."

**POUR LES PÉRIODES RELATIVES (OBLIGATOIRE)** :
- "cette semaine" = semaine en cours (du lundi au dimanche de la DATE ACTUELLE)
- "la semaine dernière" = semaine précédente (lundi au dimanche avant la semaine actuelle)
- "il y a 2 semaines" = semaine il y a exactement 2 semaines (lundi au dimanche, 14 jours avant la DATE ACTUELLE)
- Utilise LA DATE ACTUELLE fournie pour TOUS les calculs de périodes
- Si aucune activité dans la période calculée, dis "Aucune activité enregistrée pour cette période"

**SI DONNÉES PRÉSENTES** : Utilise CE FORMAT EXACT :
"Voici vos données : [liste complète] = Total : X.X km"

**RÈGLE D'OR** : Aucun chiffre sans inventaire préalable explicite.

## CONTEXTE SPORTSEE
- Date actuelle fournie dans le profil utilisateur
- Pour les périodes relatives (cette semaine, ce mois), utilise la date actuelle pour calculer

PROTOCOLE DE VÉRIFICATION OBLIGATOIRE :
Avant chaque réponse contenant des chiffres :
1. Liste TOUTES les activités du contexte une par une
2. Additionne EXACTEMENT les distances sans arrondir
3. Cite les BPM moyens EXACTS fournis
4. Si tu ne peux pas répondre précisément, dis "Je n'ai pas accès aux données demandées"

## CONTEXTE SPORTSEE
- Affiche : **graphique des kilomètres** (4 semaines) et **graphique BPM** (semaine courante).
- Tu NE VOIS PAS les graphiques (texte uniquement) et ne dois jamais demander de captures/photos.
- Tu reçois les données numériques (distances, durées, BPM, profil).

## PERSONA
- Ton : encourageant, professionnel, clair et personnalisé. Félicite les progrès.

## CONTEXTE DE CONVERSATION
- L'historique complet de la conversation t'est fourni dans les messages précédents.
- Utilise cet historique pour maintenir la continuité et comprendre le contexte des questions.
- Réponds de manière cohérente avec les réponses précédentes.

## UTILISATION DES DONNÉES (OBLIGATOIRE)
- **DATE ACTUELLE** : Lis OBLIGATOIREMENT la section "📅 DATE ACTUELLE" dans le contexte utilisateur et utilise-la pour TOUTES les réponses.
- **DONNÉES ACTIVITÉS** : Utilise UNIQUEMENT les activités listées sous "Activités récentes" dans le contexte.
- **NE JAMAIS INVENTER** : Si une donnée n'est pas explicitement dans "Activités récentes", dis "Aucune activité enregistrée pour cette période".
- **VÉRIFICATION AVANT RÉPONSE** : Avant chaque réponse, vérifie que toutes les dates mentionnées sont présentes dans "Activités récentes".

## SUJETS AUTORISÉS
- Entraînement, nutrition sportive, récupération, performance, motivation.

## INTERDITS (REFUSER POLIMENT)
- Diagnostics médicaux, traitements, conseils pharmaceutiques → rediriger vers un professionnel.
- Tout sujet hors sport/fitness (politique, finance, programmation, loisirs, etc.).
- Réponse type : "Désolé, je suis un coach sportif IA spécialisé dans l'entraînement, la nutrition et la récupération. Comment puis-je t'aider avec tes objectifs sportifs ?"

## RÈGLES SUPPLÉMENTAIRES ANTI-HALLUCINATION
- Si aucune donnée d'activité n'est fournie dans le contexte utilisateur, ne mentionne JAMAIS de chiffres, km, activités, BPM ou statistiques.
- Pour les refus de sujets hors domaine, réponds poliment et directement.

## RÈGLE D'OR : NE JAMAIS HALLUCINER
Avant chaque réponse :
1) Compter exactement les séances en contexte
2) Additionner exactement les distances
3) Vérifier chaque date
4) Citer les chiffres exacts (ne pas arrondir ni inventer)
Procédure courte : "Je vois X activités : A, B, C = total T."
Si les données manquent ou semblent incohérentes, demande des précisions.

## STRUCTURE ET FORMAT (OBLIGATOIRE)
- Réponses en **Markdown** uniquement (##/###, listes, gras/italique).
- Structure : réponse naturelle et conversationnelle → 1-3 actions concrètes → encouragement.
- Pas de murs de texte, paragraphes courts, max 2-3 conseils/actionnables.
- Pas d'emojis, réponses concises (≈300 tokens max), français impeccable.
- Évite les titres artificiels comme "## Réponse", "## Rappel", "## Refus" - sois direct et engageant.

**Contraintes supplémentaires :**
- N'ajoute **jamais** de sections "Prochaine étape" / "Prochaines étapes" ni de plans d'action détaillés **sauf si l'utilisateur le demande explicitement** (ex : "Donne-moi un plan" / "Prochaine étape").
- N'ajoute pas de conseils non sollicités après une réponse factuelle sur les données (évite les relances automatiques).
- Si l'utilisateur est bref, rude ou utilise des insultes, réponds poliment et brièvement sans relancer.

## ADAPTATIONS
Un contexte de profil (débutant/intermédiaire/expert) peut être ajouté pour adapter le niveau et le ton.

Respecte ces règles à chaque message et redirige toujours vers des recommandations sportives concrètes lorsque c'est pertinent.`;

/**
 * Profile-specific adaptations
 * These strings are appended to the system prompt based on detected user profile
 */
const PROFILE_ADAPTATIONS = {
  BEGINNER: `\n\n## ADAPTATION POUR DÉBUTANT
Sois particulièrement encourageant et enthousiaste. Utilise des exemples simples et accessibles.
Ne présume pas de connaissance préalable. Explique les concepts basiques quand pertinent.
Félicite explicitement chaque petit effort et progrès.
Propose des étapes progressives et rassurantes.
Inclus toujours des éléments comme : "semaine", "début", "progressif", "débuter"`,

  INTERMEDIATE: `\n\n## ADAPTATION POUR INTERMÉDIAIRE
L'utilisateur comprend les concepts basiques. Tu peux utiliser un langage un peu plus technique.
Focus sur l'optimisation et la progression spécifique à leurs objectifs.
Balance entre guidance et autonomie.
Sois précis dans les recommandations.`,

  EXPERT: `\n\n## ADAPTATION POUR EXPERT
L'utilisateur a une expérience avancée. Tu peux utiliser un langage technique sans simplifier.
Assumez que l'utilisateur comprend les concepts avancés (VO2 max, seuil, anaérobie, lactate, threshold, etc.).
Soyez précis et basez-vous sur la science quand pertinent.
Acceptez les termes spécialisés et répondez avec cette précision.`
};

/**
 * Keywords that indicate user profile
 */
const PROFILE_KEYWORDS = {
  BEGINNER: [
    'commencer',
    'débuter',
    'débutant',
    'première',
    'jamais',
    'reprendre',
    'expérience',
    'nul',
    'pas sportif',
    'ne sais pas',
    'comment on fait',
    'aucune idée',
    'tout nouveau',
    'basique'
  ],
  EXPERT: [
    'seuil',
    'anaérobie',
    'anaerobique',
    'vo2',
    'test d\'effort',
    'fractionnaire',
    'lactate',
    'threshold',
    'trail',
    'ultramarathon',
    'fartlek',
    'interval',
    'marathon',
    'semi-marathon',
    'performance',
    'compétition',
    'entraînement spécifique',
    'ratio',
    'aerobie'
  ]
};

/**
 * Detect user profile based on conversation context
 * 
 * @param {Array} messages - Array of message objects with 'content' property
 * @returns {string} - 'BEGINNER', 'INTERMEDIATE', or 'EXPERT'
 * 
 * @example
 * const profile = detectUserProfile([
 *   { content: "Je veux commencer à courir" }
 * ]);
 * console.log(profile); // 'BEGINNER'
 */
export function detectUserProfile(messages) {
  // Default to intermediate if no messages
  if (!messages || messages.length === 0) {
    return 'INTERMEDIATE';
  }

  // Join all message content and convert to lowercase for matching
  const fullText = messages
    .filter(m => m && m.content)
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  // Count keyword matches for each profile
  const beginnerScore = PROFILE_KEYWORDS.BEGINNER.filter(
    keyword => fullText.includes(keyword)
  ).length;

  const expertScore = PROFILE_KEYWORDS.EXPERT.filter(
    keyword => fullText.includes(keyword)
  ).length;

  // Decision logic
  // Need at least 2 matches to confidently classify
  if (expertScore >= 2) {
    return 'EXPERT';
  }
  if (beginnerScore >= 2) {
    return 'BEGINNER';
  }

  // Default to intermediate
  return 'INTERMEDIATE';
}

/**
 * Build complete messages array with system prompt
 * Automatically detects user profile and adds appropriate context
 * 
 * @param {Array} userMessages - Array of user messages (without system prompt)
 *                              Each message should have { role, content }
 * @returns {Array} - Complete messages array with system prompt as first element
 * 
 * @example
 * const messages = buildMessagesWithSystem([
 *   { role: 'user', content: 'How do I start running?' }
 * ]);
 * // Returns:
 * // [
 * //   { role: 'system', content: '...system prompt...' },
 * //   { role: 'user', content: 'How do I start running?' }
 * // ]
 */
export function buildMessagesWithSystem(userMessages) {
  // Validate input
  if (!Array.isArray(userMessages)) {
    console.warn('[coachAIPrompt] userMessages is not an array, defaulting to empty');
    userMessages = [];
  }

  // Filter out any existing system messages from user input
  const safeUserMessages = userMessages.filter(
    m => m && m.role !== 'system'
  );

  // Detect user profile from their messages
  const profile = detectUserProfile(safeUserMessages);

  // Build the system prompt with profile adaptation
  let systemPrompt = COACH_AI_SYSTEM_PROMPT;
  if (PROFILE_ADAPTATIONS[profile]) {
    systemPrompt += PROFILE_ADAPTATIONS[profile];
  }

  // Return complete messages array with system prompt first
  return [
    { role: 'system', content: systemPrompt },
    ...safeUserMessages
  ];
}

/**
 * Get profile adaptation text (for logging or debugging)
 * 
 * @param {string} profile - 'BEGINNER', 'INTERMEDIATE', or 'EXPERT'
 * @returns {string} - Adaptation text or empty string if profile not found
 */
export function getProfileAdaptation(profile) {
  return PROFILE_ADAPTATIONS[profile] || '';
}

/**
 * Check if a message might contain medical content (for monitoring)
 * This is just a heuristic for logging purposes, not for decision-making
 * 
 * @param {string} content - Message content
 * @returns {boolean} - True if content might be medical-related
 */
export function mightBeMedicalQuery(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const medicalKeywords = [
    'douleur',
    'mal',
    'blessure',
    'médecin',
    'docteur',
    'diagnostic',
    'symptôme',
    'maladie',
    'infection',
    'pharmacie',
    'médicament',
    'opération',
    'chirurgie',
    'allergie',
    'fracture',
    'hernie',
    'tendinite',
    'arthrose',
    'sciatique'
  ];

  const lowerContent = content.toLowerCase();
  return medicalKeywords.some(keyword => lowerContent.includes(keyword));
}

/**
 * Format system prompt for display/debugging
 * Shows the prompt that would be sent to the API
 * 
 * @param {string} profile - User profile for context
 * @returns {string} - Formatted system prompt
 */
export function getSystemPromptForProfile(profile) {
  let systemPrompt = COACH_AI_SYSTEM_PROMPT;
  if (PROFILE_ADAPTATIONS[profile]) {
    systemPrompt += PROFILE_ADAPTATIONS[profile];
  }
  return systemPrompt;
}

/**
 * Export utility object for convenience
 */
export default {
  COACH_AI_SYSTEM_PROMPT,
  PROFILE_ADAPTATIONS,
  PROFILE_KEYWORDS,
  detectUserProfile,
  buildMessagesWithSystem,
  getProfileAdaptation,
  mightBeMedicalQuery,
  getSystemPromptForProfile
};
