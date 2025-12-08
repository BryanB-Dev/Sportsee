'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Affichage pendant la redirection
  return (
    <div className={styles.homeContainer}>
      <div className={styles.loadingSpinner}></div>
      
      <h1 className={styles.mainTitle}>
        SportSee
      </h1>
      
      <p className={styles.redirectionText}>
        Redirection en cours...
      </p>
    </div>
  );
}
