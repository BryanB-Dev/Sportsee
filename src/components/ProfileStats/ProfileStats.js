import styles from './ProfileStats.module.css';

export default function ProfileStats({ userData, stats }) {
  return (
    <div className={styles.rightColumn}>
      <div className={styles.statsHeader}>
        <h2 className={styles.statsTitle}>Vos statistiques</h2>
        <p className={styles.statsSubtitle}>depuis le {userData.createdAt}</p>
      </div>

      <div className={styles.statsGrid}>
        {/* Colonne 1 */}
        <div className={styles.statsColumn}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Temps total couru</p>
            <div className={styles.statValue}>
              <span className={styles.statMain}>{stats.hours}h</span>
              <span className={styles.statSub}>{stats.minutes}min</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Distance totale parcourue</p>
            <div className={styles.statValue}>
              <span className={styles.statMain}>{stats.totalDistance}</span>
              <span className={styles.statSub}>km</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Nombre de sessions</p>
            <div className={styles.statValue}>
              <span className={styles.statMain}>{stats.totalSessions}</span>
              <span className={styles.statSub}>sessions</span>
            </div>
          </div>
        </div>

        {/* Colonne 2 */}
        <div className={styles.statsColumn}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Calories brûlées</p>
            <div className={styles.statValue}>
              <span className={styles.statMain}>{stats.totalCalories.toLocaleString()}</span>
              <span className={styles.statSub}>cal</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Distance moyenne</p>
            <div className={styles.statValue}>
              <span className={styles.statMain}>{stats.averageDistance}</span>
              <span className={styles.statSub}>km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
