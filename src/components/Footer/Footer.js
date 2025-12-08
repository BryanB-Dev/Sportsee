'use client';

import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Left section - Copyright */}
      <div className={styles.leftSection}>
        <span className={styles.copyrightText}>©Sportsee</span>
        <span className={styles.rightsText}>Tous droits réservés</span>
      </div>

      {/* Right section - Links and Logo */}
      <div className={styles.rightSection}>
        <a href="#" className={`${styles.link} ${styles.linkConditions}`}>
          Conditions générales
        </a>
        <a href="#" className={`${styles.link} ${styles.linkContact}`}>
          Contact
        </a>
        
        {/* Logo with bars */}
        <div className={styles.logo}>
          {/* Bar 1 - Left */}
          <div className={`${styles.logoBar} ${styles.bar1Bottom}`}></div>
          <div className={`${styles.logoBar} ${styles.bar1Top}`}></div>
          
          {/* Bar 2 - Center left */}
          <div className={`${styles.logoBar} ${styles.bar2Bottom}`}></div>
          <div className={`${styles.logoBar} ${styles.bar2Top}`}></div>
          
          {/* Bar 3 - Center */}
          <div className={`${styles.logoBar} ${styles.bar3Bottom}`}></div>
          <div className={`${styles.logoBar} ${styles.bar3Top}`}></div>
          
          {/* Bar 4 - Center right */}
          <div className={`${styles.logoBar} ${styles.bar4Bottom}`}></div>
          <div className={`${styles.logoBar} ${styles.bar4Top}`}></div>
          
          {/* Bar 5 - Right */}
          <div className={`${styles.logoBar} ${styles.bar5Bottom}`}></div>
          <div className={`${styles.logoBar} ${styles.bar5Top}`}></div>
        </div>
      </div>
    </footer>
  );
}