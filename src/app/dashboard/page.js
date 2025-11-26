'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardMetrics, useNutritionalMetrics, useErrorHandling } from '../../hooks/useAppData';
import DataTester from '../../components/DataTester/DataTester';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { metrics, isLoading: dataLoading, hasErrors } = useDashboardMetrics();
  const { nutritionalData } = useNutritionalMetrics();
  const { hasAnyError, getFormattedError } = useErrorHandling();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Afficher un loader pendant la vérification de l'authentification ou le chargement des données
  if (authLoading || isRedirecting) {
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

  // Afficher les erreurs si nécessaire
  if (hasAnyError) {
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
          <div className={styles.errorContainer}>
            <h2>Erreur de chargement des données</h2>
            <p>{getFormattedError('profile') || getFormattedError('statistics') || getFormattedError('activity')}</p>
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        </main>
      </div>
    );
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
                {dataLoading ? (
                  <div className={styles.chartLoader}>Chargement des données...</div>
                ) : metrics ? (
                  <div className={styles.chartPlaceholder}>
                    <p>Sessions cette semaine: {metrics.weeklyPerformance.sessionsCount}</p>
                    <p>Distance moyenne: {metrics.averageDistance} km</p>
                    <p>FC moyenne: {metrics.averageHeartRate} BPM</p>
                    <p>Graphique d'activité (à implémenter avec Recharts)</p>
                  </div>
                ) : (
                  <p>Aucune donnée d'activité disponible</p>
                )}
              </div>
              
              <div className={styles.miniChartsRow}>
                <div className={styles.miniChart}>
                  <h4>Durée moyenne des sessions</h4>
                  {dataLoading ? (
                    <div className={styles.chartLoader}>...</div>
                  ) : (
                    <div className={styles.chartPlaceholder}>
                      <p>Durée moyenne: {metrics?.weeklyPerformance.totalDuration / (metrics?.weeklyPerformance.sessionsCount || 1) || 0} min</p>
                      <p>Graphique linéaire (à implémenter)</p>
                    </div>
                  )}
                </div>
                <div className={styles.miniChart}>
                  <h4>Radar de performance</h4>
                  <p>Graphique radar (à implémenter)</p>
                </div>
                <div className={styles.miniChart}>
                  <h4>Score</h4>
                  {dataLoading ? (
                    <div className={styles.chartLoader}>...</div>
                  ) : (
                    <div className={styles.chartPlaceholder}>
                      <p>Score: {Math.min(100, (metrics?.weeklyPerformance.sessionsCount || 0) * 14)}%</p>
                      <p>Graphique radial (à implémenter)</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Sidebar avec métriques */}
            <aside className={styles.sidebar}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🔥</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>
                    {dataLoading ? '...' : `${nutritionalData.calories}kCal`}
                  </span>
                  <span className={styles.metricLabel}>Calories</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🥩</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>
                    {dataLoading ? '...' : `${nutritionalData.proteins}g`}
                  </span>
                  <span className={styles.metricLabel}>Proteines</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🍎</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>
                    {dataLoading ? '...' : `${nutritionalData.carbohydrates}g`}
                  </span>
                  <span className={styles.metricLabel}>Glucides</span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🥑</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricValue}>
                    {dataLoading ? '...' : `${nutritionalData.fats}g`}
                  </span>
                  <span className={styles.metricLabel}>Lipides</span>
                </div>
              </div>
            </aside>
          </div>

          {/* Composant de test temporaire */}
          <DataTester />
          
        </div>
      </main>
    </div>
  );
}