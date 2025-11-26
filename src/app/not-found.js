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
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page non trouvée</h1>
        <p className={styles.description}>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className={styles.actions}>
          <button 
            onClick={handleGoHome}
            className={styles.primaryButton}
          >
            {isAuthenticated ? 'Retour au dashboard' : 'Se connecter'}
          </button>
          <button 
            onClick={handleGoBack}
            className={styles.secondaryButton}
          >
            Page précédente
          </button>
        </div>
        
        <div className={styles.logo}>
          Sport<span>See</span>
        </div>
      </div>
    </div>
  );
}