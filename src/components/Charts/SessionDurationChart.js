'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './SessionDurationChart.module.css';

export default function SessionDurationChart({ data, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState} style={{ '--chart-height': `${height}px` }}>
        Aucune donnée disponible
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipText}>{`${label} : ${payload[0].value} min`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="day" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#74798c' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#74798c' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="sessionLength" 
          stroke="#ff0101" 
          strokeWidth={3}
          dot={{ r: 4, fill: '#ff0101' }}
          activeDot={{ r: 6, fill: '#ff0101' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}