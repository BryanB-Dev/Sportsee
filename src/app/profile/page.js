'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardMetrics } from '../../hooks/useAppData';
import { useData } from '../../contexts/DataContext';

// Import des composants
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ProfileHeader from '../../components/ProfileHeader/ProfileHeader';
import ProfileDetails from '../../components/ProfileDetails/ProfileDetails';
import ProfileStats from '../../components/ProfileStats/ProfileStats';

// Import du CSS Module
import styles from './profile.module.css';

export default function Profile() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { metrics, isLoading: dataLoading } = useDashboardMetrics();
  const { activity } = useData();
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

  if (authLoading || dataLoading || isRedirecting) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Données utilisateur
  const createdAtRaw = metrics?.userInfo?.createdAt;

  const userData = {
    firstName: metrics?.userInfo?.firstName || 'Clara',
    lastName: metrics?.userInfo?.lastName || 'Dupont',
    age: metrics?.userInfo?.age || 29,
    weight: metrics?.userInfo?.weight || 58,
    height: metrics?.userInfo?.height || 168,
    gender: metrics?.userInfo?.gender || null,
    profilePicture: metrics?.userInfo?.profilePicture || '/clara-avatar.jpg',
    createdAt: createdAtRaw
      ? new Date(createdAtRaw).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Date inconnue'
  };

  // Statistiques : utiliser les stats fournies (totalDuration, totalDistance, totalSessions)
  const totalDuration = metrics?.totalDuration !== undefined ? Number(metrics.totalDuration) : 0;
  const totalDistance = metrics?.totalDistance !== undefined ? Number(metrics.totalDistance) : 0;
  const totalSessions = metrics?.totalSessions !== undefined ? Number(metrics.totalSessions) : 0;

  const hours = Math.floor(totalDuration / 60);
  const minutes = Math.round(totalDuration % 60);

  // Calculs requis à partir des activités
  const totalCalories = activity && activity.length > 0
    ? activity.reduce((sum, session) => sum + (session.caloriesBurned || 0), 0)
    : 0;

  const averageDistance = totalSessions > 0
    ? Math.round((totalDistance / totalSessions) * 10) / 10
    : 0;

  const stats = {
    hours,
    minutes,
    totalDistance: Math.round(totalDistance),
    totalSessions,
    totalCalories,
    averageDistance
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header onLogout={handleLogout} userName={userData.firstName} />

      <main className={styles.main}>
        <div className={styles.profileContainer}>
          {/* Colonne gauche */}
          <div className={styles.leftColumn}>
            <ProfileHeader userData={userData} />
            <ProfileDetails userData={userData} />
          </div>

          {/* Colonne droite */}
          <ProfileStats userData={userData} stats={stats} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
