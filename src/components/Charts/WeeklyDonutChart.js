'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './WeeklyDonutChart.module.css';

export default function WeeklyDonutChart({ 
  sessionsCount = 0, 
  maxSessions = 6
}) {
  // Si l'objectif est dépassé, afficher 100% réalisé
  const actualSessions = Math.min(sessionsCount, maxSessions);
  const remaining = Math.max(0, maxSessions - sessionsCount);
  
  const data = [
    { name: 'Réalisées', value: actualSessions },
    { name: 'Restantes', value: remaining }
  ];

  const colors = ['#0B23F4', '#B6BDFC'];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.mainValue}>
            <span className={styles.number}>x{sessionsCount}</span>
            <span className={styles.objective}>sur objectif de {maxSessions}</span>
          </div>
          <p className={styles.subtitle}>Courses hebdomadaire réalisées</p>
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        <ResponsiveContainer width={306} height={190.64}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={81}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              paddingAngle={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Légende en haut à droite - restants */}
        <div className={styles.legendTop}>
          <div className={styles.legendCircle}>
            <div className={`${styles.legendDot} ${styles.legendDotRemaining}`}></div>
          </div>
          <span className={styles.legendText}>{remaining} restants</span>
        </div>
        
        {/* Légende en bas à gauche - réalisées */}
        <div className={styles.legendBottom}>
          <div className={styles.legendCircle}>
            <div className={`${styles.legendDot} ${styles.legendDotCompleted}`}></div>
          </div>
          <span className={styles.legendText}>{sessionsCount} réalisées</span>
        </div>
      </div>
    </section>
  );
}