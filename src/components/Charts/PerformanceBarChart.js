'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, ReferenceLine, Line, ComposedChart } from 'recharts';
import { useState } from 'react';
import styles from './PerformanceBarChart.module.css';

// Fonctions utilitaires pour les dates
const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit', 
    month: 'short' 
  }).format(date);
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const getWeekStart = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Lundi = 1
  result.setDate(diff);
  return result;
};

const getWeekEnd = (date) => {
  const weekStart = getWeekStart(date);
  return addDays(weekStart, 6);
};

const renderLegend = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className={styles.legendWrapper}>
      {payload.map((entry, key) => (
        <div key={key} className={styles.legendItem}>
          <span
            className={styles.legendIcon}
            style={{ backgroundColor: entry.color }}
          />
          <span className={styles.legendLabel}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function PerformanceBarChart({ 
  id = 'chart',
  data, 
  title, 
  color = "#6366f1", 
  height = 300,
  showGrid = true,
  showAxes = true,
  barRadius = [6, 6, 0, 0],
  isKilometersChart = false,
  isBPMChart = false,
  averageDistance = 18,
  averageBPM = 163,
  activityData = null
}) {
  // Calculer les dates basées sur les données d'activité réelles
  const getInitialStartDate = () => {
    if (activityData && activityData.length > 0) {
      return new Date(activityData[0].date);
    }
    return subtractDays(new Date(), 27);
  };

  const getInitialBpmStartDate = () => {
    if (activityData && activityData.length > 0) {
      const lastIndex = Math.max(0, activityData.length - 7);
      return new Date(activityData[lastIndex].date);
    }
    return subtractDays(new Date(), 6);
  };

  const [startDate, setStartDate] = useState(getInitialStartDate());
  const [bpmStartDate, setBpmStartDate] = useState(getInitialBpmStartDate());

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState} style={{ '--chart-height': `${height}px` }}>
        Aucune donnée disponible
      </div>
    );
  }

  // Style pour le graphique des kilomètres
  if (isKilometersChart) {
    const [isHovered, setIsHovered] = useState(false);
    const endDate = addDays(startDate, 27);

    // Calculer la moyenne hebdomadaire (à partir des totaux hebdomadaires affichés)
    const computedAvgPerWeek = Number(
      (data.reduce((sum, d) => sum + (d.value || 0), 0) / data.length).toFixed(1)
    );

    // Calculer la valeur max et des pas arrondis à 5
    const maxValue = Math.max(...data.map(d => d.value || 0));
    // Top arrondi au multiple de 5 supérieur
    const top = Math.max(5, Math.ceil(maxValue / 5) * 5);
    // Step = tiers de top, arrondi au multiple de 5 supérieur, min 5
    const step = Math.max(5, Math.ceil((top / 3) / 5) * 5);
    const actualMaxScale = step * 3;
    // 4 graduations régulières
    const ticks = [0, step, step * 2, step * 3];

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    return (
      <section>
        <div 
          className={styles.chartCard}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.headerRow}>
            <h4 className={styles.titlePrimary}>{computedAvgPerWeek}km en moyenne</h4>
            <div className={styles.navContainer}>
              <button 
                className={styles.navButton}
                onClick={() => setBpmStartDate(prev => subtractDays(prev, 7))}
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
                  <path d="M2 10L6 6L2 2" strokeLinecap="round"/>
                </svg>
              </button>
              <span className={styles.navSpan}>
                {formatDate(bpmStartDate)} - {formatDate(endDate)}
              </span>
              <button 
                className={styles.navButton}
                onClick={() => setBpmStartDate(prev => addDays(prev, 7))}
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10L6 6L2 2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p className={styles.subtitle}>Total des kilomètres des 4 dernières semaines</p>
          <div className={styles.chartOffset}>
            <ResponsiveContainer width="85%" height={325}>
              <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" horizontal={true} vertical={false} />
                <XAxis 
                  key={`${id}-xaxis`}
                  dataKey="day" 
                  orientation="bottom" 
                  dy={10} 
                  tickLine={false} 
                  tick={{fontSize:12}}
                />
                <YAxis 
                  key={`${id}-yaxis`}
                  tickLine={false} 
                  domain={[0, actualMaxScale]} 
                  ticks={ticks} 
                  tick={{fontSize:10}}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      // Calculer les dates de la semaine pour ce point
                      const weekIndex = data.findIndex(d => d.day === label);
                      const weekStartDate = addDays(startDate, weekIndex * 7);
                      const weekEndDate = addDays(weekStartDate, 6);
                      
                      const formatTooltipDate = (date) => {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        return `${day}.${month}`;
                      };

                      return (
                        <div className={styles.tooltip}>
                          <div className={styles.tooltipDate}>
                            {formatTooltipDate(weekStartDate)} - {formatTooltipDate(weekEndDate)}
                          </div>
                          <div className={styles.tooltipValue}>
                            {payload[0].value} km
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  iconType="circle" 
                  iconSize={8} 
                  align="left" 
                  formatter={(value) => <span className={styles.legendLabel}>{value}</span>}  
                  content={renderLegend}
                />
                <Bar 
                  dataKey="value" 
                  name="Km" 
                  fill={isHovered ? "#0B23F4" : "#b6bdfc"} 
                  radius={30} 
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  }

  // Style pour le graphique BPM (copié du graphique km avec ligne de moyenne ajoutée)
  if (isBPMChart) {
    const [isHovered, setIsHovered] = useState(false);
    const endDate = addDays(bpmStartDate, 6);

    // Calculer la valeur maximale/minimale et des pas arrondis à la dizaine pour BPM
    const allBpmValues = data.flatMap(d => [d.min || 0, d.max || 0, d.average || 0]);
    const maxBpmValue = Math.max(...allBpmValues);
    const minBpmValue = Math.min(...allBpmValues);

    // Domain borné par min et max réels, arrondis aux multiples de 5
    // Ajoute une marge de 10 en dessous du minimum
    let minBpmScale = Math.floor((minBpmValue - 10) / 5) * 5;
    let topBpm = Math.max(5, Math.ceil(maxBpmValue / 5) * 5);
    // Step = tiers de la plage, arrondi au multiple de 5 supérieur, min 5
    let bpmStep = Math.max(5, Math.ceil(((topBpm - minBpmScale) / 3) / 5) * 5);
    // Si plage nulle (toutes valeurs identiques), créer une petite plage autour de la valeur (15 = 3 * 5)
    if (topBpm === minBpmScale) {
      minBpmScale = Math.max(0, minBpmScale - 5);
      topBpm = minBpmScale + 15;
      bpmStep = 5;
    }
    const actualMaxBpmScale = minBpmScale + bpmStep * 3;
    const bpmTicks = [minBpmScale, minBpmScale + bpmStep, minBpmScale + bpmStep * 2, minBpmScale + bpmStep * 3];

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    return (
      <section>
        <div 
          className={styles.chartCard}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.headerRow}>
            <h4 className={styles.titleAccent}>{averageBPM} bpm</h4>
            <div className={styles.navContainer}>
              <button 
                className={styles.navButton}
                onClick={() => setStartDate(prev => subtractDays(prev, 7))}
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
                  <path d="M2 10L6 6L2 2" strokeLinecap="round"/>
                </svg>
              </button>
              <span className={styles.navSpan}>
                {formatDate(bpmStartDate)} - {formatDate(endDate)}
              </span>
              <button 
                className={styles.navButton}
                onClick={() => setStartDate(prev => addDays(prev, 7))}
              >
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10L6 6L2 2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p className={styles.subtitle}>Fréquence cardiaque moyenne</p>
          <div className={styles.chartOffset}>
            <ResponsiveContainer width="85%" height={325}>
              <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" horizontal={true} vertical={false} />
                <XAxis 
                key={`${id}-xaxis`}
                dataKey="day" 
                orientation="bottom" 
                dy={10} 
                tickLine={false} 
                tick={{fontSize:12}}
                axisLine={true}
              />
              <YAxis 
                key={`${id}-yaxis`}
                tickLine={false} 
                domain={[minBpmScale, actualMaxBpmScale]} 
                ticks={bpmTicks} 
                tick={{fontSize:10}}
              />
              <Tooltip content={() => null} />
              <Legend 
                iconType="circle" 
                iconSize={8} 
                align="left" 
                formatter={(value) => <span className={styles.legendLabel}>{value}</span>}  
                content={renderLegend}
              />
              <Bar 
                dataKey="min" 
                name="Min" 
                fill="#fcc1b6" 
                radius={30} 
                barSize={14}
              />
              <Bar 
                dataKey="max" 
                name="Max BPM" 
                fill="#f4320b" 
                radius={30} 
                barSize={14}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke={isHovered ? "#0b23f4" : "#f2f3ff"} 
                strokeWidth={2}
                dot={{ r: 4, fill: "#0b23f4" }}
                name="Moyenne BPM"
                connectNulls={false}
                offset={7}
              />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  }
}