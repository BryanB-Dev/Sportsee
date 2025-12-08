'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.errorTitle}>Page non trouvée</h1>
        <p className={styles.errorDescription}>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className={styles.actionsContainer}>
          <button 
            onClick={handleGoHome}
            className={styles.primaryActionButton}
          >
            {isAuthenticated ? 'Retour au dashboard' : 'Se connecter'}
          </button>
          <button 
            onClick={handleGoBack}
            className={styles.secondaryActionButton}
          >
            Page précédente
          </button>
        </div>
        
        <div className={styles.brandLogo}>
          Sport<span>See</span>
        </div>
      </div>
    </div>
  );
}