// Fichier de démonstration et test des mocks créés
// Ce fichier peut être utilisé pour valider la structure des données

import { 
  mockAuthUsers, 
  mockUserInfo, 
  mockUserActivity,
  mockLogin,
  mockGetUserInfo,
  mockGetUserActivity
} from './apiData.js';

import {
  transformActivityForBarChart,
  transformActivityForLineChart,
  transformActivityForRadarChart,
  calculateWeeklyGoalProgress,
  calculateKeyStats,
  generateDashboardData
} from '../utils/dataTransformers.js';

/**
 * Fonction de test pour valider les mocks
 */
export async function testMocks() {
  console.log('=== TEST DES MOCKS SPORTSEE ===');

  try {
    // Test 1: Authentification
    console.log('\n1. Test d\'authentification:');
    const loginResult = await mockLogin('sophiemartin', 'password123');
    console.log('✅ Login réussi:', loginResult);

    // Test 2: Récupération des infos utilisateur
    console.log('\n2. Test des informations utilisateur:');
    const userInfo = await mockGetUserInfo('user123');
    console.log('✅ Infos utilisateur:', userInfo);

    // Test 3: Récupération de l'activité
    console.log('\n3. Test de l\'activité utilisateur:');
    const activity = await mockGetUserActivity('user123');
    console.log('✅ Activité utilisateur:', activity);

    // Test 4: Transformation pour graphiques
    console.log('\n4. Test des transformations de données:');
    
    const barChartData = transformActivityForBarChart(activity);
    console.log('✅ Données graphique en barres:', barChartData);
    
    const lineChartData = transformActivityForLineChart(activity);
    console.log('✅ Données graphique linéaire:', lineChartData);
    
    const radarChartData = transformActivityForRadarChart(activity, userInfo.profile);
    console.log('✅ Données graphique radar:', radarChartData);
    
    // Test 5: Calculs de métriques
    console.log('\n5. Test des calculs de métriques:');
    
    const weeklyProgress = calculateWeeklyGoalProgress(activity, userInfo.weeklyGoal || 2);
    console.log('✅ Progrès hebdomadaire:', weeklyProgress);
    
    const keyStats = calculateKeyStats(activity, userInfo.profile);
    console.log('✅ Statistiques clés:', keyStats);
    
    // Test 6: Génération complète du dashboard
    console.log('\n6. Test de génération complète du dashboard:');
    const dashboardData = generateDashboardData('user123', userInfo, activity);
    console.log('✅ Données complètes du dashboard:', dashboardData);

    console.log('\n=== TOUS LES TESTS RÉUSSIS ===');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    return false;
  }
}

/**
 * Fonction pour afficher un aperçu de toutes les données disponibles
 */
export function showDataOverview() {
  console.log('=== APERÇU DES DONNÉES DISPONIBLES ===');
  
  console.log('\n📊 Utilisateurs disponibles:');
  mockAuthUsers.forEach(user => {
    console.log(`  - ${user.username} (${user.userId})`);
  });
  
  console.log('\n📈 Structure des données d\'activité:');
  console.log('  Chaque session contient:');
  console.log('  - date: Date de la session');
  console.log('  - distance: Distance parcourue en km');
  console.log('  - duration: Durée en minutes');
  console.log('  - heartRate: { min, max, average } BPM');
  console.log('  - caloriesBurned: Calories brûlées');
  
  console.log('\n🎯 Endpoints mockés:');
  console.log('  - POST /api/login (username, password)');
  console.log('  - GET /api/user-info (profile, statistics)');
  console.log('  - GET /api/user-activity (sessions avec filtrage par dates)');
  
  console.log('\n📋 Graphiques supportés:');
  console.log('  - BarChart: Distance et calories par jour');
  console.log('  - LineChart: Durée moyenne par jour de la semaine');
  console.log('  - RadarChart: Performance sur 6 métriques');
  console.log('  - RadialBarChart: Progrès vers l\'objectif hebdomadaire');
}

/**
 * Fonction pour valider la cohérence des données avec l'API réelle
 */
export function validateDataConsistency() {
  console.log('=== VALIDATION DE LA COHÉRENCE DES DONNÉES ===');
  
  const issues = [];
  
  // Vérifier que tous les utilisateurs ont des données
  mockAuthUsers.forEach(user => {
    if (!mockUserInfo[user.userId]) {
      issues.push(`❌ Pas d'info utilisateur pour ${user.userId}`);
    }
    
    if (!mockUserActivity[user.userId]) {
      issues.push(`❌ Pas d'activité pour ${user.userId}`);
    }
  });
  
  // Vérifier la structure des données d'activité
  Object.keys(mockUserActivity).forEach(userId => {
    const activities = mockUserActivity[userId];
    activities.forEach((activity, index) => {
      const required = ['date', 'distance', 'duration', 'heartRate', 'caloriesBurned'];
      required.forEach(field => {
        if (activity[field] === undefined) {
          issues.push(`❌ Champ manquant '${field}' dans l'activité ${index} de ${userId}`);
        }
      });
    });
  });
  
  if (issues.length === 0) {
    console.log('✅ Toutes les données sont cohérentes avec la structure de l\'API');
  } else {
    console.log('⚠️ Problèmes détectés:');
    issues.forEach(issue => console.log(issue));
  }
  
  return issues.length === 0;
}

// Export pour utilisation dans d'autres fichiers
export default {
  testMocks,
  showDataOverview,
  validateDataConsistency
};