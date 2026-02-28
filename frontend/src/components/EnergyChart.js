import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function EnergyChart({ energyData }) {
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartType, setChartType] = useState('bar');

  if (!energyData || !energyData.timeSeries) {
    return <p>No data available</p>;
  }

  const chartData = {
    labels: energyData.timeSeries.map(item => item.label),
    datasets: [
      {
        label: 'Energy Production (kWh)',
        data: energyData.timeSeries.map(item => item.value),
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Energy Production`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toFixed(2)} kWh`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energy (kWh)'
        }
      }
    }
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    // TODO: Fetch new data from API with new time range
  };

  const ChartComponent = chartType === 'bar' ? Bar : Line;

  return (
    <div className="energy-chart">
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select value={timeRange} onChange={(e) => handleTimeRangeChange(e.target.value)}>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>

      <ChartComponent data={chartData} options={options} />

      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '4px' 
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Production Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <strong>Daily:</strong><br />
            {Math.round(energyData.summary.dailyProduction)} kWh
          </div>
          <div>
            <strong>Monthly:</strong><br />
            {Math.round(energyData.summary.monthlyProduction)} kWh
          </div>
          <div>
            <strong>Yearly:</strong><br />
            {Math.round(energyData.summary.yearlyProduction)} kWh
          </div>
          <div>
            <strong>25-Year Total:</strong><br />
            {Math.round(energyData.summary.yearlyProduction * 25 * 0.875)} kWh
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnergyChart;
