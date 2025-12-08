'use client';

import WeeklyDonutChart from '../Charts/WeeklyDonutChart';
import styles from './WeeklySection.module.css';

export default function WeeklySection({ 
  sessionsCount = 4,
  maxSessions = 6,
  totalDuration = 140,
  totalDistance = 21.7,
  isLoading = false 
}) {
  if (isLoading) {
    return (
      <section className={styles.weeklySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Cette semaine</h2>
          <p className={styles.sectionSubtitle}>Chargement...</p>
        </div>
        <div className={styles.weeklyGrid}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingPlaceholder}>Chargement...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.weeklySection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Cette semaine</h2>
        <p className={styles.sectionSubtitle}>Du 23/06/2025 au 30/06/2025</p>
      </div>
      
      <div className={styles.weeklyGrid}>
        {/* Carte avec nouveau donut chart */}
        <WeeklyDonutChart 
          sessionsCount={sessionsCount}
          maxSessions={maxSessions}
        />

        {/* Cartes statistiques */}
        <div className={styles.statsColumn}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Durée d'activité</div>
            <div className={styles.statValueRow}>
              <span className={styles.statValuePrimary}>{totalDuration}</span>
              <span className={styles.statUnitPrimary}>minutes</span>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardDistance}`}>
            <div className={styles.statLabel}>Distance</div>
            <div className={styles.statValueRow}>
              <span className={styles.statValueDistance}>{totalDistance}</span>
              <span className={styles.statUnitDistance}>kilomètres</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}