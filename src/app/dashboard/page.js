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
import ChatAIModal from '../../components/ChatAI/ChatAIModal';

// Import du CSS Module
import styles from './dashboard.module.css';

const alignToMonday = (date) => {
  const monday = new Date(date);
  const day = monday.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + offset);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export default function Dashboard() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { metrics, isLoading: dataLoading, hasErrors } = useDashboardMetrics();
  const { hasAnyError, getFormattedError } = useErrorHandling();
  const { chartData: chartsData, isLoading: chartsLoading } = useChartData();
  const { activity } = useData(); // Accès direct aux données d'activité
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);

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
        <Header onLogout={handleLogout} onOpenCoach={() => setCoachOpen(true)} />
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
  
  const sessionsCount = metrics?.weeklyPerformance.sessionsCount || 0;
  const totalDuration = Math.round(metrics?.weeklyPerformance.totalDuration || 0);
  const weeklyDistance = parseFloat(metrics?.weeklyPerformance.totalDistance || 0);
  const weekStart = metrics?.weeklyPerformance.weekStart;
  const weekEnd = metrics?.weeklyPerformance.weekEnd;

  // Données pour le graphique des kilomètres (basées sur les vraies données d'activité)
  const kilometersData = activity && activity.length > 0
    ? (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fourWeeksAgo = new Date(alignToMonday(today));
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        const dayBuckets = [];
        for (let week = 0; week < 4; week++) {
          const weekStart = new Date(fourWeeksAgo);
          weekStart.setDate(weekStart.getDate() + week * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const weekData = activity.filter(session => {
            const sessionDate = new Date(session.date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate >= weekStart && sessionDate <= weekEnd;
          });

          const totalKm = weekData.reduce((sum, session) => sum + session.distance, 0);
          dayBuckets.push({ day: `S${week + 1}`, value: parseFloat(totalKm.toFixed(1)) });
        }

        return dayBuckets;
      })()
    : chartsLoading
      ? []
      : [
          { day: 'S1', value: parseFloat((weeklyDistance * 0.6).toFixed(1)) },
          { day: 'S2', value: parseFloat((weeklyDistance * 1.2).toFixed(1)) },
          { day: 'S3', value: parseFloat((weeklyDistance * 0.8).toFixed(1)) },
          { day: 'S4', value: parseFloat((weeklyDistance).toFixed(1)) }
        ];

  // Données pour le graphique BPM (semaine en cours : lundi à dimanche)
  const heartRateData = (() => {
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const heartRateChartData = [];
    
    // Calculer lundi et dimanche de cette semaine
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ...
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const mondayThisWeek = new Date(today);
    mondayThisWeek.setDate(today.getDate() - daysSinceMonday);
    
    // Formater la date en YYYY-MM-DD local (pas UTC)
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Créer un tableau des 7 jours de la semaine (lundi à dimanche)
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(mondayThisWeek);
      currentDay.setDate(mondayThisWeek.getDate() + i);
      const dateStr = formatLocalDate(currentDay);
      
      // Chercher une session d'activité pour ce jour
      const sessionForDay = activity?.find(session => session.date === dateStr);
      
      if (sessionForDay) {
        heartRateChartData.push({
          day: dayNames[i],
          min: sessionForDay.heartRate.min,
          max: sessionForDay.heartRate.max,
          average: sessionForDay.heartRate.average,
          value: i
        });
      } else {
        // Aucune donnée pour ce jour
        heartRateChartData.push({
          day: dayNames[i],
          min: 0,
          max: 0,
          average: 0,
          value: i
        });
      }
    }
    
    return heartRateChartData;
  })();

  // Calculer la moyenne BPM pour la semaine courante seulement
  const averageBPMThisWeek = (() => {
    const bpmValues = heartRateData
      .filter(d => d.average > 0) // Exclure les jours sans données
      .map(d => d.average);
    
    if (bpmValues.length === 0) return 0;
    return Math.round(bpmValues.reduce((sum, val) => sum + val, 0) / bpmValues.length);
  })();

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header onLogout={handleLogout} onOpenCoach={() => setCoachOpen(true)} />

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
                id="km-chart"
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
                id="bpm-chart"
                data={heartRateData}
                title="Fréquence cardiaque"
                color="#F4320B"
                height={400}
                isBPMChart={true}
                averageBPM={averageBPMThisWeek}
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
          weekStart={weekStart}
          weekEnd={weekEnd}
          isLoading={dataLoading}
        />
      </main>

      {/* Footer */}
      <Footer />
      <ChatAIModal open={coachOpen} onClose={() => setCoachOpen(false)} />
    </div>
  );
}