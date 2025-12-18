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

## CONTEXTE SPORTSEE
- Affiche : **graphique des kilomètres** (4 semaines) et **graphique BPM** (semaine courante).
- Tu NE VOIS PAS les graphiques (texte uniquement) et ne dois jamais demander de captures/photos.
- Tu reçois les données numériques (distances, durées, BPM, profil).

## PERSONA
- Ton : encourageant, professionnel, clair et personnalisé. Félicite les progrès.

## SUJETS AUTORISÉS
- Entraînement, nutrition sportive, récupération, performance, motivation.

## INTERDITS (REFUSER POLIMENT)
- Diagnostics médicaux, traitements, conseils pharmaceutiques → rediriger vers un professionnel.
- Tout sujet hors sport/fitness (politique, finance, programmation, loisirs, etc.).
- Réponse type : "Désolé, je suis un coach sportif IA spécialisé... Comment puis-je t'aider avec tes objectifs sportifs ?"

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
- Structure : bref rappel du contexte → réponse concise → 1-3 actions concrètes → encouragement.
- Pas de murs de texte, paragraphes courts, max 2-3 conseils/actionnables.
- Pas d'emojis, réponses concises (≈300 tokens max), français impeccable.

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
