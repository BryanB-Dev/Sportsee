'use client';

import { useAppData } from '../../contexts/DataContext';
import { useDashboardMetrics } from '../../hooks/useAppData';
import styles from './DataTester.module.css';

export default function DataTester() {
  const { 
    profile, 
    statistics, 
    activity, 
    isLoading, 
    hasErrors, 
    loadAllUserData,
    refreshData 
  } = useAppData();
  
  const { metrics } = useDashboardMetrics();

  if (isLoading) {
    return <div className={styles.loading}>Chargement des données de test...</div>;
  }

  if (hasErrors) {
    return (
      <div className={styles.error}>
        <h3>Erreur lors du chargement</h3>
        <button onClick={refreshData}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Test de la gestion d'état globale</h2>
      
      <div className={styles.section}>
        <h3>Profil utilisateur</h3>
        {profile ? (
          <div>
            <p><strong>Nom:</strong> {profile.firstName} {profile.lastName}</p>
            <p><strong>Âge:</strong> {profile.age} ans</p>
            <p><strong>Poids:</strong> {profile.weight} kg</p>
            <p><strong>Taille:</strong> {profile.height} cm</p>
          </div>
        ) : (
          <p>Aucun profil chargé</p>
        )}
      </div>

      <div className={styles.section}>
        <h3>Statistiques</h3>
        {statistics ? (
          <div>
            <p><strong>Distance totale:</strong> {statistics.totalDistance} km</p>
            <p><strong>Sessions totales:</strong> {statistics.totalSessions}</p>
            <p><strong>Durée totale:</strong> {statistics.totalDuration} min</p>
          </div>
        ) : (
          <p>Aucune statistique chargée</p>
        )}
      </div>

      <div className={styles.section}>
        <h3>Activité récente</h3>
        {activity && activity.length > 0 ? (
          <div>
            <p><strong>Nombre de sessions:</strong> {activity.length}</p>
            <p><strong>Dernière session:</strong> {activity[activity.length - 1]?.date}</p>
            <p><strong>Distance moyenne:</strong> {metrics?.averageDistance} km</p>
            <p><strong>FC moyenne:</strong> {metrics?.averageHeartRate} BPM</p>
          </div>
        ) : (
          <p>Aucune activité chargée</p>
        )}
      </div>

      <div className={styles.actions}>
        <button onClick={loadAllUserData}>Recharger toutes les données</button>
        <button onClick={refreshData}>Actualiser</button>
      </div>
    </div>
  );
}