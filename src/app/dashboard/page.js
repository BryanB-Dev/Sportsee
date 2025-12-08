'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardMetrics, useErrorHandling, useChartData } from '../../hooks/useAppData';
import { useData } from '../../contexts/DataContext';

// Import des composants
import Header from '../../components/Header/Header';
import IntroSection from '../../components/IntroSection/IntroSection';
import UserProfile from '../../components/UserProfile/UserProfile';
import PerformanceCharts from '../../components/PerformanceCharts/PerformanceCharts';
import WeeklySection from '../../components/WeeklySection/WeeklySection';
import PerformanceBarChart from '../../components/Charts/PerformanceBarChart';
import Footer from '../../components/Footer/Footer';

// Import du CSS Module
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { metrics, isLoading: dataLoading, hasErrors } = useDashboardMetrics();
  const { hasAnyError, getFormattedError } = useErrorHandling();
  const { chartData: chartsData, isLoading: chartsLoading } = useChartData();
  const { activity } = useData(); // Accès direct aux données d'activité
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
        <p className={styles.loader}>Chargement...</p>
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
        <Header onLogout={handleLogout} />
        <main className={styles.errorContainer}>
          <div>
            <h2>Erreur de chargement des données</h2>
            <p>{getFormattedError('profile') || getFormattedError('statistics') || getFormattedError('activity')}</p>
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Préparer les données pour les composants en utilisant les vraies données des mocks
  const userData = {
    firstName: metrics?.userInfo?.firstName || 'Utilisateur',
    lastName: metrics?.userInfo?.lastName || '',
    profilePicture: metrics?.userInfo?.profilePicture || null,
    memberSince: metrics?.userInfo?.createdAt 
      ? new Date(metrics.userInfo.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '14 juin 2023'
  };

  // Conversion sécurisée des valeurs numériques depuis les mocks
  const totalDistance = metrics?.statistics?.totalDistance 
    ? Math.round(parseFloat(metrics.statistics.totalDistance)) 
    : (activity && activity.length > 0 
        ? Math.round(activity.reduce((sum, session) => sum + session.distance, 0))
        : 0);
  
  const averageDistance = metrics?.averageDistance 
    ? parseFloat(metrics.averageDistance).toFixed(1)
    : 0;
  
  const averageHeartRate = metrics?.averageHeartRate 
    ? Math.round(parseFloat(metrics.averageHeartRate)) 
    : 0;
  
  const sessionsCount = metrics?.weeklyPerformance.sessionsCount || 4;
  const totalDuration = Math.round(metrics?.weeklyPerformance.totalDuration || 140);
  const weeklyDistance = Math.round(metrics?.weeklyPerformance.totalDistance || 21.7);

  // Données pour le graphique des kilomètres (basées sur les vraies données d'activité)
  const kilometersData = activity && activity.length > 0
    ? (() => {
        const weeklyData = [];
        const sessionsPerWeek = Math.ceil(activity.length / 4);
        
        // Regrouper par semaine (4 semaines)
        for (let week = 0; week < 4; week++) {
          const startIndex = week * sessionsPerWeek;
          const endIndex = Math.min((week + 1) * sessionsPerWeek, activity.length);
          const weekData = activity.slice(startIndex, endIndex);
          
          if (weekData.length > 0) {
            const totalKm = weekData.reduce((sum, session) => sum + session.distance, 0);
            weeklyData.push({ day: `S${week + 1}`, value: Math.round(totalKm * 10) / 10 });
          }
        }
        
        // Remplir avec des valeurs par défaut si nécessaire
        while (weeklyData.length < 4) {
          weeklyData.push({ day: `S${weeklyData.length + 1}`, value: 0 });
        }
        
        return weeklyData;
      })()
    : [
        { day: 'S1', value: Math.round(weeklyDistance * 0.6) },
        { day: 'S2', value: Math.round(weeklyDistance * 1.2) },
        { day: 'S3', value: Math.round(weeklyDistance * 0.8) },
        { day: 'S4', value: weeklyDistance }
      ];

  // Données pour le graphique BPM (basées sur les vraies données d'activité)
  const heartRateData = activity && activity.length > 0
    ? activity.slice(0, 7).map((session, index) => {
        const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        return {
          day: dayNames[index] || `J${index + 1}`,
          min: session.heartRate.min,
          max: session.heartRate.max,
          average: session.heartRate.average
        };
      })
    : [
        { day: 'Lun', min: 135, max: 165, average: 150 },
        { day: 'Mar', min: 142, max: 172, average: 157 },
        { day: 'Mer', min: 145, max: 185, average: 165 },
        { day: 'Jeu', min: 140, max: 170, average: 155 },
        { day: 'Ven', min: 137, max: 168, average: 152 },
        { day: 'Sam', min: 145, max: 163, average: 154 },
        { day: 'Dim', min: 138, max: 175, average: 156 }
      ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header onLogout={handleLogout} />

      <main className={styles.main}>
        {/* Section d'introduction */}
        <IntroSection />

        {/* Profil utilisateur */}
        <UserProfile 
          user={userData}
          totalDistance={totalDistance}
        />

        {/* Section des graphiques */}
        <div className={styles.chartsSection}>
          {/* Graphiques de performance avec remplacement du graphique de gauche */}
          <PerformanceCharts
            distanceData={[]} // Vide car remplacé par le nouveau graphique
            heartRateData={[]} // Vide car remplacé par le nouveau graphique BPM
            averageDistance={averageDistance}
            averageHeartRate={averageHeartRate}
            isLoading={chartsLoading}
            customLeftChart={
              <PerformanceBarChart
                data={kilometersData}
                title="Kilomètres parcourus"
                color="#B6BDFC"
                height={400}
                isKilometersChart={true}
                averageDistance={averageDistance}
                activityData={activity}
              />
            }
            customRightChart={
              <PerformanceBarChart
                data={heartRateData}
                title="Fréquence cardiaque"
                color="#F4320B"
                height={400}
                isBPMChart={true}
                averageBPM={averageHeartRate}
                activityData={activity}
              />
            }
          />
        </div>

        {/* Section hebdomadaire */}
        <WeeklySection
          sessionsCount={sessionsCount}
          maxSessions={6}
          totalDuration={totalDuration}
          totalDistance={weeklyDistance}
          isLoading={dataLoading}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}