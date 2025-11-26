'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fafafa'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid #e9ecef',
        borderTop: '6px solid #ff0101',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '30px'
      }}></div>
      
      <h1 style={{
        color: '#ff0101',
        fontSize: '3rem',
        fontWeight: '700',
        margin: '0 0 15px 0'
      }}>
        SportSee
      </h1>
      
      <p style={{
        color: '#74798c',
        fontSize: '1.2rem',
        textAlign: 'center',
        margin: 0
      }}>
        Redirection en cours...
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
