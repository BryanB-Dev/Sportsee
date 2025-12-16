"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MarkdownMessage.module.css';

/**
 * Component to render markdown formatted messages
 * Supports: bold, italic, lists, links, code blocks, etc.
 */
export default function MarkdownMessage({ content }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Paragraphs
        p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
        
        // Headings
        h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
        h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
        h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
        
        // Lists
        ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
        ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
        li: ({ children }) => <li className={styles.li}>{children}</li>,
        
        // Code
        code: ({ inline, children }) => 
          inline ? (
            <code className={styles.inlineCode}>{children}</code>
          ) : (
            <code className={styles.codeBlock}>{children}</code>
          ),
        pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
        
        // Links
        a: ({ href, children }) => (
          <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        
        // Strong and emphasis
        strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
        em: ({ children }) => <em className={styles.em}>{children}</em>,
        
        // Blockquote
        blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
