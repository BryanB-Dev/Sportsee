'use client';

import styles from './PerformanceCharts.module.css';

export default function PerformanceCharts({ 
  isLoading = false,
  customLeftChart = null,
  customRightChart = null
}) {

  if (isLoading) {
    return (
      <section className={styles.performanceSection}>
        <h2 className={styles.sectionTitle}>Vos dernières performances</h2>
        <div className={styles.performanceGrid}>
          <div className={`${styles.performanceCard} ${styles.performanceCardLoading}`}>
            <div className={styles.loadingPlaceholder}>Chargement...</div>
          </div>
          <div className={`${styles.performanceCard} ${styles.performanceCardLoading}`}>
            <div className={styles.loadingPlaceholder}>Chargement...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.performanceSection}>
      <h2 className={styles.sectionTitle}>Vos dernières performances</h2>
      <div className={styles.performanceGrid}>
        {customLeftChart ? (
          customLeftChart
        ) : (
          <div className={styles.performanceCard}>
            <div className={styles.chartPlaceholder}>Aucun graphique fourni</div>
          </div>
        )}

        {customRightChart ? (
          customRightChart
        ) : (
          <div className={styles.performanceCard}>
            <div className={styles.chartPlaceholder}>Aucun graphique fourni</div>
          </div>
        )}
      </div>
    </section>
  );
}