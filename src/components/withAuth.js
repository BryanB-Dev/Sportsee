'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * HOC (Higher Order Component) pour protéger les routes nécessitant une authentification
 * @param {React.Component} WrappedComponent - Le composant à protéger
 * @returns {React.Component} - Le composant protégé
 */
export default function withAuth(WrappedComponent) {
  return function ProtectedRoute(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.replace('/login');
        } else {
          setIsChecking(false);
        }
      }
    }, [isAuthenticated, isLoading, router]);

    // Loader pendant la vérification
    if (isLoading || isChecking) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#fafafa'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #ff0101',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p style={{ color: '#74798c', fontSize: '1.1rem' }}>
            Vérification de l'authentification...
          </p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    // Afficher le composant si authentifié
    if (isAuthenticated) {
      return <WrappedComponent {...props} />;
    }

    // Ne rien afficher pendant la redirection
    return null;
  };
}