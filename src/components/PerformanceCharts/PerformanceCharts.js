'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './PerformanceCharts.module.css';

export default function PerformanceCharts({ 
  distanceData = [],
  heartRateData = [],
  averageDistance = 18,
  averageHeartRate = 163,
  isLoading = false,
  customLeftChart = null,
  customRightChart = null
}) {
  const CustomTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const unit = type === 'distance' ? 'km' : 'BPM';
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            {value} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

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
        {/* Graphique Distance - Remplaçable par customLeftChart */}
        {customLeftChart ? (
          customLeftChart
        ) : (
          <div className={styles.performanceCard}>
            <div className={styles.performanceHeader}>
              <h3 className={styles.performanceTitle}>
                {averageDistance}km en moyenne
              </h3>
              <p className={styles.performanceSubtitle}>
                Tous vos résultats à 4 dernières semaines
              </p>
              <div className={styles.periodSelector}>
                <span className={styles.periodBadge}>26 mai - 25 juin</span>
              </div>
            </div>
            <div className={styles.chartContainer}>
              {distanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={distanceData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip type="distance" />} />
                    <Bar 
                      dataKey="value" 
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.chartPlaceholder}>
                  Aucune donnée de distance
                </div>
              )}
            </div>
          </div>
        )}

        {/* Graphique Fréquence Cardiaque - Remplaçable par customRightChart */}
        {customRightChart ? (
          customRightChart
        ) : (
          <div className={styles.performanceCard}>
            <div className={styles.performanceHeader}>
              <h3 className={styles.performanceTitle}>
                {averageHeartRate} BPM
              </h3>
              <p className={styles.performanceSubtitle}>
                Fréquence cardiaque moyenne
              </p>
              <div className={styles.periodSelector}>
                <span className={styles.periodBadge}>28 mai - 04 juin</span>
              </div>
            </div>
            <div className={styles.chartContainer}>
              {heartRateData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={heartRateData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip type="heartRate" />} />
                    <Bar 
                      dataKey="value" 
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.chartPlaceholder}>
                  Aucune donnée de fréquence cardiaque
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}