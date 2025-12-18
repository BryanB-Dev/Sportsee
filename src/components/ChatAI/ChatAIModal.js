"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatAIModal.module.css";
import { sendChat } from "@/services/chatService";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { buildUserContext } from "@/utils/chatDataFormatter";
import { validateAIResponse, generateHonestFallback } from "@/utils/aiResponseValidator";
import MarkdownMessage from "./MarkdownMessage";

export default function ChatAIModal({ open, onClose }) {
  const { user } = useAuth();
  const { activity, statistics, profile } = useData();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [contextSent, setContextSent] = useState(false);
  const listRef = useRef(null);

  // Construire le contexte utilisateur une seule fois
  const userContext = useMemo(() => {
    return buildUserContext({
      user,
      statistics,
      activities: activity
    });
  }, [user, statistics, activity]);

  const avatarUrl = profile?.profilePicture || "/default-avatar.svg";
  const avatarAlt = profile ? `${profile.firstName} ${profile.lastName}` : "Profil";

  const canSend = useMemo(() => !loading && input.trim().length > 0, [loading, input]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setContextSent(false); // Reset pour la prochaine ouverture
      onClose?.();
    }, 300); // Match animation duration
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    // Block body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const suggestions = [
    "Comment améliorer mon endurance ?",
    "Que signifie mon score de récupération ?",
    "Peux-tu m'expliquer mon dernier graphique ?",
  ];

  const pickSuggestion = useCallback((text) => {
    setInput(text);
  }, []);

  const doSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    
    // Avertir si l'utilisateur demande une explication sur les graphiques mais les données ne sont pas chargées
    const askingAboutGraphics = /graphique|km|bpm|distance|cardiaque|performance|activit/i.test(text);
    const askingBpm = /bpm|cardiaque|rythme/i.test(text);
    if (askingAboutGraphics && (!activity || activity.length === 0)) {
      setMessages((prev) => [...prev, 
        { role: "user", content: text },
        { role: "assistant", content: "⏳ Données en cours de chargement...\n\nMes données d'activité sont toujours en train de se charger. Réessayez dans quelques secondes pour une réponse plus précise sur vos graphiques.\n\nEn attendant, je peux répondre à d'autres questions sur l'entraînement en général !" }
      ]);
      setInput("");
      return;
    }
    
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    try {
      // Limiter à 50 messages max (25 échanges) pour rester dans les limites de tokens de l'API
      // Garder toujours le contexte (premier système) et les messages récents
      const ctx = [...messages, { role: "user", content: text }].slice(-50);
      
      // Inclure le contexte utilisateur uniquement pour le premier message
      const options = { messages: ctx };
      if (!contextSent && userContext) {
        options.userContext = userContext;
        setContextSent(true);
      }
      
      // If the user used rude language, include a short system override asking the assistant to be brief and not to follow up
      const rude = /\b(tg|ta gueule|putain|merde|connard|salope)\b/i.test(text);
      if (rude) {
        options.messages = [...(options.messages || []), { role: 'system', content: "Réponds brièvement et poliment ; ne relance pas et n'offre pas de conseils non sollicités." }];
      }

      const { reply } = await sendChat(options);
      if (!reply) {
        throw new Error("Pas de réponse de l'API");
      }
      
      // Valider la réponse contre les données réelles si l'utilisateur demande une explication de graphique
      let finalReply = reply;
      if (askingAboutGraphics && activity && activity.length > 0) {
        const validation = validateAIResponse(reply, activity);
        if (!validation.valid) {
          // Détecter si la question est une demande BPM courte pour renvoyer une réponse concise
          const shortBpmQuestion = askingBpm && (/^\s*(?:quels?|quel|quelle|quelles|as-tu|donne|quelle est)\b.*\b(bpm|rythme|cardiaque)/i.test(text) || text.trim().split(/\s+/).length <= 5);
          // Remplacer par une réponse honnête basée sur les vraies données
          finalReply = generateHonestFallback(activity, {
            reason: "",
            focus: askingBpm ? "bpm" : "general",
            short: shortBpmQuestion,
          });
        }
      }

      // Post-process reply: remove unsolicited 'Prochaine étape' / 'Conseils' blocks
      const askedForPlan = /plan|prochaine\s+étape|prochaine\s+etape|que faire|exemple de plan/i.test(text);
      const askedForAdvice = /conseil|conseils|que faire|comment faire|plan/i.test(text);
      if (!askedForPlan && /prochaine\s+étape|prochaines\s+étapes/i.test(finalReply)) {
        // strip the 'Prochaine étape(s)' section and anything after it
        finalReply = finalReply.replace(/\n?\s*Prochaine étape[s\s:]*[\s\S]*$/i, '').trim();
      }
      if (!askedForAdvice && /\*\*Conseils ?:?\*\*/i.test(finalReply)) {
        // remove the Advice section
        finalReply = finalReply.replace(/\n?\s*\*\*Conseils[\s\S]*$/i, '').trim();
      }

      // Remove emojis when present (prompt forbids emojis)
      // Simple regex to remove common emoji ranges
      finalReply = finalReply.replace(/[\u231A-\u32FF\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, '').trim();
      
      setMessages((prev) => [...prev, { role: "assistant", content: finalReply }]);
    } catch (e) {
      console.error("[Chat] Erreur:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, je n'ai pas pu répondre. Erreur: " + (e?.message || "inconnue") }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, contextSent, userContext, activity]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) doSend();
    }
  }, [canSend, doSend]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <section className={`${styles.modal} ${isClosing ? styles.modalClosing : ''}`} role="dialog" aria-modal="true" aria-label="Coach IA" onClick={(e) => e.stopPropagation()}>
        <div className={styles.topArea}>
          <div className={styles.closeRow}>
            <div className={styles.closeInner}>
              <button className={styles.closeBtn} aria-label="Fermer" onClick={handleClose}>
                <span className={styles.closeText}>Fermer</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2l8 8M10 2L2 10" stroke="#717171" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          {messages.length === 0 && (
            <h4 className={styles.headline}>Posez vos questions sur votre programme, vos performances ou vos objectifs</h4>
          )}
        </div>

        <div className={styles.chatArea} ref={listRef} role="log" aria-live="polite">
          {messages.map((m, idx) => (
            m.role === 'user' ? (
              <div className={styles.userRow} key={idx}>
                <div className={styles.userBubble}><p className={styles.userText}>{m.content}</p></div>
                <img src={avatarUrl} alt={avatarAlt} className={styles.userAvatar} />
              </div>
            ) : (
              <div className={styles.assistantRow} key={idx}>
                <div className={styles.assistantAvatar} aria-hidden="true">
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.85961 4.36917C6.03709 3.79065 6.85605 3.79065 7.03353 4.36917L7.86444 7.07768C7.92418 7.27241 8.07661 7.42483 8.27134 7.48457L10.9798 8.31548C11.5584 8.49296 11.5584 9.31193 10.9798 9.4894L8.27134 10.3203C8.07661 10.3801 7.92418 10.5325 7.86444 10.7272L7.03353 13.4357C6.85605 14.0142 6.03709 14.0142 5.85961 13.4357L5.0287 10.7272C4.96896 10.5325 4.81654 10.3801 4.62181 10.3203L1.9133 9.4894C1.33478 9.31193 1.33478 8.49296 1.9133 8.31548L4.62181 7.48457C4.81654 7.42483 4.96896 7.27241 5.0287 7.07768L5.85961 4.36917Z" fill="#FCC1B6"/>
                    <path d="M10.8274 0.728877C10.8951 0.508487 11.207 0.508487 11.2747 0.728877L11.5912 1.76069C11.614 1.83487 11.672 1.89294 11.7462 1.9157L12.778 2.23223C12.9984 2.29984 12.9984 2.61183 12.778 2.67944L11.7462 2.99598C11.672 3.01874 11.614 3.0768 11.5912 3.15099L11.2747 4.1828C11.207 4.40319 10.8951 4.40319 10.8274 4.1828L10.5109 3.15099C10.4882 3.0768 10.4301 3.01874 10.3559 2.99598L9.32409 2.67944C9.1037 2.61183 9.1037 2.29984 9.32409 2.23223L10.3559 1.9157C10.4301 1.89294 10.4882 1.83487 10.5109 1.76069L10.8274 0.728877Z" fill="#FCC1B6"/>
                    <path d="M12.2788 11.4395C12.3718 11.1365 12.8007 11.1365 12.8937 11.4395L13.3289 12.8583C13.3602 12.9603 13.4401 13.0401 13.5421 13.0714L14.9608 13.5066C15.2639 13.5996 15.2639 14.0286 14.9608 14.1215L13.5421 14.5568C13.4401 14.5881 13.3602 14.6679 13.3289 14.7699L12.8937 16.1887C12.8007 16.4917 12.3718 16.4917 12.2788 16.1887L11.8436 14.7699C11.8123 14.6679 11.7324 14.5881 11.6304 14.5568L10.2117 14.1215C9.90864 14.0286 9.90864 13.5996 10.2117 13.5066L11.6304 13.0714C11.7324 13.0401 11.8123 12.9603 11.8436 12.8583L12.2788 11.4395Z" fill="#FCC1B6"/>
                  </svg>
                </div>
                <div className={styles.assistantContainer}>
                  <div className={styles.assistantSender}>Coach AI</div>
                  <div className={styles.assistantBubble}>
                    <div className={styles.assistantText}>
                      <MarkdownMessage content={m.content} />
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
          {loading && (
            <div className={styles.assistantRow}>
              <div className={styles.assistantAvatar} aria-hidden="true">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.85961 4.36917C6.03709 3.79065 6.85605 3.79065 7.03353 4.36917L7.86444 7.07768C7.92418 7.27241 8.07661 7.42483 8.27134 7.48457L10.9798 8.31548C11.5584 8.49296 11.5584 9.31193 10.9798 9.4894L8.27134 10.3203C8.07661 10.3801 7.92418 10.5325 7.86444 10.7272L7.03353 13.4357C6.85605 14.0142 6.03709 14.0142 5.85961 13.4357L5.0287 10.7272C4.96896 10.5325 4.81654 10.3801 4.62181 10.3203L1.9133 9.4894C1.33478 9.31193 1.33478 8.49296 1.9133 8.31548L4.62181 7.48457C4.81654 7.42483 4.96896 7.27241 5.0287 7.07768L5.85961 4.36917Z" fill="#FCC1B6"/>
                  <path d="M10.8274 0.728877C10.8951 0.508487 11.207 0.508487 11.2747 0.728877L11.5912 1.76069C11.614 1.83487 11.672 1.89294 11.7462 1.9157L12.778 2.23223C12.9984 2.29984 12.9984 2.61183 12.778 2.67944L11.7462 2.99598C11.672 3.01874 11.614 3.0768 11.5912 3.15099L11.2747 4.1828C11.207 4.40319 10.8951 4.40319 10.8274 4.1828L10.5109 3.15099C10.4882 3.0768 10.4301 3.01874 10.3559 2.99598L9.32409 2.67944C9.1037 2.61183 9.1037 2.29984 9.32409 2.23223L10.3559 1.9157C10.4301 1.89294 10.4882 1.83487 10.5109 1.76069L10.8274 0.728877Z" fill="#FCC1B6"/>
                  <path d="M12.2788 11.4395C12.3718 11.1365 12.8007 11.1365 12.8937 11.4395L13.3289 12.8583C13.3602 12.9603 13.4401 13.0401 13.5421 13.0714L14.9608 13.5066C15.2639 13.5996 15.2639 14.0286 14.9608 14.1215L13.5421 14.5568C13.4401 14.5881 13.3602 14.6679 13.3289 14.7699L12.8937 16.1887C12.8007 16.4917 12.3718 16.4917 12.2788 16.1887L11.8436 14.7699C11.8123 14.6679 11.7324 14.5881 11.6304 14.5568L10.2117 14.1215C9.90864 14.0286 9.90864 13.5996 10.2117 13.5066L11.6304 13.0714C11.7324 13.0401 11.8123 12.9603 11.8436 12.8583L12.2788 11.4395Z" fill="#FCC1B6"/>
                </svg>
              </div>
              <div className={styles.loadingDots}>
                <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.dot1}>
                  <circle cx="3.55556" cy="3.55556" r="3.55556" fill="#FCC1B6"/>
                </svg>
                <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.dot2}>
                  <circle cx="3.55556" cy="3.55556" r="3.55556" fill="#FCC1B6"/>
                </svg>
                <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.dot3}>
                  <circle cx="3.55556" cy="3.55556" r="3.55556" fill="#FCC1B6"/>
                </svg>
                <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.dot4}>
                  <circle cx="3.55556" cy="3.55556" r="3.55556" fill="#FCC1B6"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className={styles.middleArea}>
          <div className={styles.inputBox}>
            <div className={styles.inputRow}>
              <div className={styles.inputIcon} aria-hidden="true">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.85961 4.36917C6.03709 3.79065 6.85605 3.79065 7.03353 4.36917L7.86444 7.07768C7.92418 7.27241 8.07661 7.42483 8.27134 7.48457L10.9798 8.31548C11.5584 8.49296 11.5584 9.31193 10.9798 9.4894L8.27134 10.3203C8.07661 10.3801 7.92418 10.5325 7.86444 10.7272L7.03353 13.4357C6.85605 14.0142 6.03709 14.0142 5.85961 13.4357L5.0287 10.7272C4.96896 10.5325 4.81654 10.3801 4.62181 10.3203L1.9133 9.4894C1.33478 9.31193 1.33478 8.49296 1.9133 8.31548L4.62181 7.48457C4.81654 7.42483 4.96896 7.27241 5.0287 7.07768L5.85961 4.36917Z" fill="#FCC1B6"/>
                  <path d="M10.8274 0.728877C10.8951 0.508487 11.207 0.508487 11.2747 0.728877L11.5912 1.76069C11.614 1.83487 11.672 1.89294 11.7462 1.9157L12.778 2.23223C12.9984 2.29984 12.9984 2.61183 12.778 2.67944L11.7462 2.99598C11.672 3.01874 11.614 3.0768 11.5912 3.15099L11.2747 4.1828C11.207 4.40319 10.8951 4.40319 10.8274 4.1828L10.5109 3.15099C10.4882 3.0768 10.4301 3.01874 10.3559 2.99598L9.32409 2.67944C9.1037 2.61183 9.1037 2.29984 9.32409 2.23223L10.3559 1.9157C10.4301 1.89294 10.4882 1.83487 10.5109 1.76069L10.8274 0.728877Z" fill="#FCC1B6"/>
                  <path d="M12.2788 11.4395C12.3718 11.1365 12.8007 11.1365 12.8937 11.4395L13.3289 12.8583C13.3602 12.9603 13.4401 13.0401 13.5421 13.0714L14.9608 13.5066C15.2639 13.5996 15.2639 14.0286 14.9608 14.1215L13.5421 14.5568C13.4401 14.5881 13.3602 14.6679 13.3289 14.7699L12.8937 16.1887C12.8007 16.4917 12.3718 16.4917 12.2788 16.1887L11.8436 14.7699C11.8123 14.6679 11.7324 14.5881 11.6304 14.5568L10.2117 14.1215C9.90864 14.0286 9.90864 13.5996 10.2117 13.5066L11.6304 13.0714C11.7324 13.0401 11.8123 12.9603 11.8436 12.8583L12.2788 11.4395Z" fill="#FCC1B6"/>
                </svg>
              </div>
              <textarea
                className={styles.textInput}
                placeholder="Comment puis-je vous aider ?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
              />
            </div>
            <div className={styles.sendRow}>
              <button type="button" className={styles.sendBtn} aria-label="Envoyer" onClick={doSend} disabled={!canSend}>
                <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.suggestions}>
            {suggestions.map((s, i) => (
              <button key={i} type="button" className={styles.suggestion} onClick={() => pickSuggestion(s)}>
                <div className={styles.suggestionText}>{s}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
