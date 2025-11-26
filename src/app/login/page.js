'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './login.module.css';

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!credentials.username || !credentials.password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        // Redirection vers le dashboard
        router.push('/dashboard');
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour remplir automatiquement les identifiants de test
  const fillTestCredentials = (username, password) => {
    setCredentials({ username, password });
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.logo}>SportSee</h1>
          <p className={styles.subtitle}>Connectez-vous à votre tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Nom d'utilisateur
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="Entrez votre nom d'utilisateur"
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Entrez votre mot de passe"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className={styles.testAccounts}>
          <p className={styles.testTitle}>Comptes de test disponibles :</p>
          <div className={styles.testButtons}>
            <button
              type="button"
              className={styles.testButton}
              onClick={() => fillTestCredentials('sophiemartin', 'password123')}
              disabled={isLoading}
            >
              Sophie Martin
            </button>
            <button
              type="button"
              className={styles.testButton}
              onClick={() => fillTestCredentials('emmaleroy', 'password789')}
              disabled={isLoading}
            >
              Emma Leroy
            </button>
            <button
              type="button"
              className={styles.testButton}
              onClick={() => fillTestCredentials('marcdubois', 'password456')}
              disabled={isLoading}
            >
              Marc Dubois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}