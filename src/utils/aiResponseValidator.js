/**
 * Validateur de réponses IA pour vérifier la cohérence avec les données réelles
 * Empêche les hallucinations en vérifiant les chiffres mentionnés
 */

/**
 * Extrait tous les nombres d'un texte (décimaux inclus)
 */
function extractNumbers(text) {
  const matches = text.match(/\d+(?:[.,]\d+)?/g) || [];
  return matches.map((m) => parseFloat(m.replace(',', '.'))).filter((n) => !Number.isNaN(n));
}

// Filtrer les activités sur les 4 dernières semaines (aligné avec les graphes)
function filterRecentActivities(activities) {
  if (!activities || activities.length === 0) return [];
  const today = new Date();
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  return activities.filter((session) => {
    const [year, month, day] = session.date.split('-').map(Number);
    const sessionDate = new Date(year, month - 1, day);
    return sessionDate >= fourWeeksAgo && sessionDate <= today;
  });
}

// Renvoie les activités de la semaine courante (lundi->dimanche)
function filterCurrentWeekActivities(activities) {
  if (!activities || activities.length === 0) return [];
  const today = new Date();
  const currentDay = today.getDay();
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - daysSinceMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return activities.filter((session) => {
    const [year, month, day] = session.date.split('-').map(Number);
    const sessionDate = new Date(year, month - 1, day);
    return sessionDate >= monday && sessionDate <= sunday;
  });
}

/**
 * Calcule les statistiques réelles des données d'activité
 * IMPORTANT: Filtre par la période affichée (4 dernières semaines) comme les graphiques
 */
export function calculateDataStatistics(activities) {
  const recentActivities = filterRecentActivities(activities);

  if (recentActivities.length === 0) {
    return {
      totalActivities: 0,
      totalKm: 0,
      avgBpm: 0,
      minBpm: 0,
      maxBpm: 0,
      weeks: {},
    };
  }

  const stats = {
    totalActivities: recentActivities.length,
    totalKm: Math.round(recentActivities.reduce((sum, a) => sum + (a.distance || 0), 0) * 10) / 10,
    avgBpm: 0,
    minBpm: 0,
    maxBpm: 0,
    activitiesPerWeek: (recentActivities.length / 4).toFixed(1),
    weeks: {},
  };

  const bpms = recentActivities.map(a => a.heartRate?.average || 0).filter(b => b > 0);
  if (bpms.length > 0) {
    stats.avgBpm = Math.round(bpms.reduce((sum, b) => sum + b, 0) / bpms.length);
    stats.minBpm = Math.min(...bpms);
    stats.maxBpm = Math.max(...bpms);
  }

  // Grouper par semaines
  recentActivities.forEach(a => {
    const [year, month, day] = a.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1); // Lundi
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!stats.weeks[weekKey]) {
      stats.weeks[weekKey] = { km: 0, activities: 0 };
    }
    stats.weeks[weekKey].km += a.distance;
    stats.weeks[weekKey].activities += 1;
  });

  return stats;
}

/**
 * Vérifie si une réponse IA est cohérente avec les données réelles
 * Retourne un objet { valid: boolean, issues: string[] }
 */
export function validateAIResponse(aiResponse, realActivities) {
  const issues = [];
  const stats = calculateDataStatistics(realActivities);

  // Chercher les activités (gère "activité(s)", "séance(s)")
  const activityMatches = aiResponse.match(/(\d+)\s*(?:activités?|séances?|activité\(s\)?|séance\(s\)?)/gi) || [];
  const mentionedActivities = activityMatches.length > 0 
    ? Math.max(...activityMatches.map(m => {
        const num = m.match(/\d+/);
        return num ? parseInt(num[0]) : 0;
      }))
    : 0;

  // Chercher "X km" ou "totalX km"
  const kmMatches = aiResponse.match(/(\d+(?:[.,]\d+)?)\s*km\b/gi) || [];
  const mentionedKm = kmMatches.length > 0
    ? Math.max(...kmMatches.map(m => {
        const num = m.match(/[\d.,]+/);
        return num ? parseFloat(num[0].replace(',', '.')) : 0;
      }))
    : 0;

  // Chercher "X BPM"
  const bpmMatches = aiResponse.match(/(\d+)\s*(?:bpm|beats?|pulsations?)/gi) || [];
  const mentionedBpms = bpmMatches.map(m => {
    const num = m.match(/\d+/);
    return num ? parseInt(num[0]) : 0;
  });
  // Dates mentionnées dans la réponse
  const mentionedDates = aiResponse.match(/\d{4}-\d{2}-\d{2}/g) || [];
  const hasActivityWord = /activit[eé]/i.test(aiResponse);
  const numbers = extractNumbers(aiResponse);

  // Accept detailed BPM lists as valid when dates mentioned correspond to real activities
  const activityDates = (realActivities || []).map(a => a.date);
  const hasMatchingDate = mentionedDates.some(d => activityDates.includes(d));
  if (/bpm/i.test(aiResponse) && mentionedDates.length > 0 && (mentionedBpms.length > 0 || /-\s*\d+\s*BPM/i.test(aiResponse)) && hasMatchingDate) {
    return { valid: true, issues: [], stats };
  }
  // Accept responses that explicitly say no activities
  if (/aucune\s+activit/i.test(aiResponse) || /pas\s+d['']activit/i.test(aiResponse)) {
    return { valid: true, issues: [], stats };
  }

  // Accept replies that explicitly list "dernières séances" with at least one date and one BPM value
  if (/derni[aè]res\s+s[eé]ances/i.test(aiResponse) && mentionedDates.length > 0 && mentionedBpms.length > 0) {
    return { valid: true, issues: [], stats };
  }

  // RÈGLE 1: Si pas d'activités réelles, l'IA ne doit rien inventer
  if (stats.totalActivities === 0) {
    if (mentionedActivities > 0) {
      issues.push(`L'IA invente ${mentionedActivities} activité(s) alors qu'il n'y en a pas`);
    }
    if (mentionedKm > 0) {
      issues.push(`L'IA invente ${mentionedKm}km alors que l'utilisateur n'a pas de données`);
    }
    return { valid: issues.length === 0, issues, stats };
  }

  // RÈGLE 2: Vérifier les activités (tolérance 50%)
  if (mentionedActivities > 0) {
    const tolerance = stats.totalActivities * 0.5;
    if (Math.abs(mentionedActivities - stats.totalActivities) > tolerance) {
      issues.push(`❌ L'IA dit ${mentionedActivities} activité(s) mais le total réel est ${stats.totalActivities}`);
    }
  } else if (hasActivityWord && stats.totalActivities > 0 && /total/i.test(aiResponse) && mentionedActivities === 0) {
    // L'IA évoque un total sans indiquer le nombre ou sans l'aligner
    issues.push("❌ L'IA évoque un total d'activités sans indiquer le nombre ou sans l'aligner avec les données réelles");
  }

  // RÈGLE 3: Vérifier les km (tolérance 30%)
  const sessionDistances = (realActivities || []).map(a => a.distance);
  if (mentionedKm > 0 && stats.totalKm > 0 && !sessionDistances.includes(mentionedKm)) {
    const tolerance = stats.totalKm * 0.3;
    if (Math.abs(mentionedKm - stats.totalKm) > tolerance) {
      issues.push(`❌ L'IA dit ${mentionedKm}km mais le total réel est ${stats.totalKm}km`);
    }
  }

  // RÈGLE 3A: Vérifier le nombre d'activités mentionné
  const mentionedActivitiesMatch = aiResponse.match(/(\d+)\s*activit/i);
  if (mentionedActivitiesMatch) {
    const mentionedCount = parseInt(mentionedActivitiesMatch[1]);
    if (mentionedCount !== stats.totalActivities) {
      issues.push(`❌ HALLUCINATION ACTIVITÉS: L'IA dit ${mentionedCount} activités mais il y en a ${stats.totalActivities} dans les données`);
    }
  }

  // RÈGLE 3B: Détecter les dates hallucinées (IA mentionne des dates qui n'existent pas)
  const dateMatches = aiResponse.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g);
  if (dateMatches && realActivities) {
    const realDates = new Set(realActivities.map(a => {
      const d = new Date(a.date);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }));

    for (const dateStr of dateMatches) {
      // Normaliser le format de date pour la comparaison
      const normalizedDate = dateStr.replace(/[-\/]/g, '/');
      if (!realDates.has(normalizedDate)) {
        issues.push(`❌ HALLUCINATION DATE: L'IA mentionne la date ${dateStr} qui n'existe pas dans les données réelles`);
      }
    }
  }

  // RÈGLE 3B: Vérifier les km si l'IA en mentionne mais qu'il n'y en a presque pas
  if (mentionedKm > 10 && stats.totalKm < 5) {
    issues.push(`❌ HALLUCINATION KM: L'IA dit ${mentionedKm}km mais le total réel est seulement ${stats.totalKm}km`);
  }

  // RÈGLE 3C: Trop de nombres alors que peu de données => probable hallucination
  // Trop de chiffres pour peu de séances → suspicion d'hallucination, sauf si c'est une réponse BPM détaillée
  if (numbers.length >= 4 && stats.totalActivities <= 2 && !/bpm/i.test(aiResponse)) {
    issues.push("🚨 Trop de chiffres pour si peu de séances réelles : suspicion d'hallucination");
  }

  // RÈGLE 4: Vérifier les BPM (tolérance 20)
  if (mentionedBpms.length > 0 && stats.avgBpm > 0) {
    const outliers = mentionedBpms.filter(b => Math.abs(b - stats.avgBpm) > 20);
    if (outliers.length > 0) {
      issues.push(`⚠️ L'IA mentionne des BPM très éloignés (${outliers.join(', ')}) de la moyenne réelle (${stats.avgBpm})`);
    }
  }

  // RÈGLE 5: Si l'IA mentionne beaucoup de chiffres mais qu'il y a très peu de données
  if (stats.totalActivities === 1 && mentionedActivities > 1) {
    issues.push(`🚨 HALLUCINATION: L'IA dit ${mentionedActivities} activités mais l'utilisateur n'a que ${stats.totalActivities}`);
  }

  // RÈGLE 6: Format Markdown cassé (maximally tolérant pour les réponses longues correctes)
  const isRefusal = aiResponse.length < 300 && /desole|coach|specialis/i.test(aiResponse);
  const isVeryLongResponse = aiResponse.length > 300; // Tolérance maximale pour les réponses longues bien formulées
  if (!aiResponse.includes('\n') && aiResponse.length > 250 && !aiResponse.includes(':') && !isRefusal && !isVeryLongResponse) {
    issues.push("⚠️ La réponse n'est pas bien formatée");
  }

  return {
    valid: issues.length === 0,
    issues,
    stats,
  };
}

/**
 * Génère une réponse de fallback honnête basée sur les données réelles
 */
export function generateHonestFallback(activities, options = {}) {
  const { reason = "", focus = "general", short = false, includeAdvice = false } = options;
  const recentActivities = filterRecentActivities(activities);
  const currentWeekActivities = filterCurrentWeekActivities(recentActivities);
  const stats = calculateDataStatistics(recentActivities);

  // Compute week-specific BPM stats (use per-session min/max when available)
  const weekBpms = (currentWeekActivities || []).map(a => a.heartRate).filter(Boolean);
  const weekAvgList = weekBpms.map(h => h.average).filter(n => typeof n === 'number' && n > 0);
  const weekMinList = weekBpms.map(h => h.min).filter(n => typeof n === 'number' && n > 0);
  const weekMaxList = weekBpms.map(h => h.max).filter(n => typeof n === 'number' && n > 0);
  const weekAvg = weekAvgList.length > 0 ? Math.round(weekAvgList.reduce((s, v) => s + v, 0) / weekAvgList.length) : 0;
  const weekMin = weekMinList.length > 0 ? Math.min(...weekMinList) : 0;
  const weekMax = weekMaxList.length > 0 ? Math.max(...weekMaxList) : 0;

  if (stats.totalActivities === 0) {
    // Court ou long selon la préférence
    if (short && focus === 'bpm') {
      return "Vous n'avez pas de données BPM enregistrées cette semaine.";
    }
    return "Réponse sécurisée: je n'ai pas trouvé de données d'activité sur les 4 dernières semaines. Dès que vous enregistrez une activité, je pourrai détailler vos graphiques.";
  }

  // Si la préférence est courte, renvoyer une réponse concise adaptée au focus
  if (short) {
    if (focus === 'bpm') {
      // Prefer precise week stats (min/max per-session) when available
      if (currentWeekActivities.length > 0 && weekAvg > 0) {
        const minDisplay = weekMin > 0 ? weekMin : (stats.minBpm || weekAvg);
        const maxDisplay = weekMax > 0 ? weekMax : (stats.maxBpm || weekAvg);
        return `Vos données BPM cette semaine : ${currentWeekActivities.length} séance(s). Moyenne: ${weekAvg} BPM (plage ${minDisplay}-${maxDisplay}).`;
      }
      return `Vous n'avez pas de données BPM enregistrées cette semaine.`;
    }
    // Format court général
    return `Résumé : ${stats.totalActivities} activité(s), ${stats.totalKm} km${stats.avgBpm > 0 ? `, moy BPM: ${stats.avgBpm}` : ''}.`;
  }

  let response = "## Analyse de vos activités\n\n";
  response += `**Résumé :**\n`;
  response += `- Total: ${stats.totalActivities} activité(s) enregistrée(s)\n`;
  response += `- Distance totale: ${stats.totalKm}km\n`;
  
  if (stats.avgBpm > 0) {
    response += `- Fréquence cardiaque moyenne: ${stats.avgBpm} BPM\n`;
    response += `- Plage: ${stats.minBpm} - ${stats.maxBpm} BPM\n`;
  }

  // Focus BPM si demandé et si on a des données cardiaques
  if (focus === "bpm" && stats.avgBpm > 0) {
    const sorted = [...recentActivities].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastSessions = sorted.slice(0, 3);
    const hasCurrentWeek = currentWeekActivities.length > 0;
    response += `\n**Focus BPM :**\n`;
    if (hasCurrentWeek) {
      response += `- Semaine en cours : ${currentWeekActivities.length} séance(s)\n`;
      currentWeekActivities.forEach((s) => {
        const hr = s.heartRate || {};
        response += `  - ${s.date} : ${hr.min ?? 'N/A'}-${hr.max ?? 'N/A'} BPM (moy ${hr.average ?? 'N/A'})\n`;
      });
    } else {
      response += `- Aucun BPM enregistré cette semaine. Voici les dernières séances disponibles :\n`;
    }
    lastSessions.forEach((s) => {
      const hr = s.heartRate || {};
      response += `- ${s.date} : ${hr.min ?? 'N/A'}-${hr.max ?? 'N/A'} BPM (moy ${hr.average ?? 'N/A'})\n`;
    });
  }

  if (includeAdvice) {
    response += `\n**Conseils :**\n`;
    if (stats.totalActivities < 3) {
      response += `- Augmentez progressivement la fréquence de vos séances (visez 2-3 par semaine)\n`;
    }
    response += `- Maintenez une hydratation régulière\n`;
    response += `- Écoutez votre corps et variez les intensités\n`;
    response += `\nContinuez vos efforts !`;
  }

  return response;
}
