'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import styles from './PerformanceRadarChart.module.css';

export default function PerformanceRadarChart({ data, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState} style={{ '--chart-height': `${height}px` }}>
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e0e0e0" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fontSize: 12, fill: '#74798c' }}
        />
        <PolarRadiusAxis 
          tick={false}
          domain={[0, 100]}
          angle={0}
        />
        <Radar 
          dataKey="value" 
          stroke="#ff0101" 
          fill="#ff0101" 
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}