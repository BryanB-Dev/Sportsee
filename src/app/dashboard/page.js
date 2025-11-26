'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading || isRedirecting) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // Ne pas afficher le contenu si pas authentifié
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>SportSee</h1>
          <div className={styles.userSection}>
            <span className={styles.welcome}>
              Bonjour <strong>{user?.firstName || 'Utilisateur'}</strong>
            </span>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.welcomeSection}>
            <h2 className={styles.title}>
              Bonjour{' '}
              <span className={styles.userName}>
                {user?.firstName || 'Utilisateur'}
              </span>
            </h2>
            <p className={styles.subtitle}>
              Félicitation ! Vous avez explosé vos objectifs hier 👏
            </p>
          </div>

          <div className={styles.dashboardGrid}>
            {/* Section principale avec graphiques */}
            <section className={styles.chartsSection}>
              <div className={styles.chartCard}>
                <h3>Activité quotidienne</h3>
                <p>Graphique d'activité (à implémenter avec Recharts)</p>
              </div>
              
              <div className={styles.miniChartsRow}>
                <div className={styles.miniChart}>
                  <h4>Durée moyenne des sessions</h4>
                  <p>Graphique linéaire (à implémenter)</p>
                </div>
                <div className={styles.miniChart}>
                  <h4>Radar de performance</h4>
                  <p>Graphique radar (à implémenter)</p>
                </div>
                <div className={styles.miniChart}>
                  <h4>Score</h4>
                  <p>Graphique radial (à implémenter)</p>
                </div>
              </div>
            </section>

            {/* Sidebar avec métriques */}
            <aside className={styles.sidebar}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🔥</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>1,930kCal</span>
                  <span className={styles.metricLabel}>Calories</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🥩</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>155g</span>
                  <span className={styles.metricLabel}>Proteines</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🍎</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>290g</span>
                  <span className={styles.metricLabel}>Glucides</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🥑</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>50g</span>
                  <span className={styles.metricLabel}>Lipides</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}