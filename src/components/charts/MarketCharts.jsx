import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Market Share Pie Chart
export const MarketSharePieChart = ({ competitors }) => {
  const data = {
    labels: competitors.map(comp => comp.name),
    datasets: [
      {
        data: competitors.map(comp => comp.share),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Market Share Distribution',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.toFixed(2)}%`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <Pie data={data} options={options} />
    </div>
  );
};

// Traffic Line Chart
export const TrafficLineChart = ({ monthlyData }) => {
  const data = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Visitors',
        data: monthlyData.map(item => item.visitors),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Monthly Traffic Trends',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Visitors: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <Line data={data} options={options} />
    </div>
  );
};

// Demographics Bar Chart
export const DemographicsBarChart = ({ ageGroups, locations }) => {
  const ageData = {
    labels: ageGroups.map(item => item.age),
    datasets: [
      {
        label: 'Age Distribution (%)',
        data: ageGroups.map(item => item.percentage),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: '#9333EA',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const locationData = {
    labels: locations.map(item => item.country),
    datasets: [
      {
        label: 'Geographic Distribution (%)',
        data: locations.map(item => item.percentage),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22C55E',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Age Distribution</h3>
        <Bar data={ageData} options={options} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Geographic Distribution</h3>
        <Bar data={locationData} options={options} />
      </div>
    </div>
  );
};

// Performance Metrics Chart
export const PerformanceMetricsChart = ({ performance }) => {
  const data = {
    labels: ['Load Time (s)', 'Bounce Rate (%)', 'Conversion Rate (%)', 'SEO Score (/100)'],
    datasets: [
      {
        label: 'Current Performance',
        data: [
          performance.loadTime,
          performance.bounceRate,
          performance.conversionRate,
          performance.seoScore
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          '#3B82F6',
          '#EF4444',
          '#22C55E',
          '#F59E0B'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Performance Metrics',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const labels = ['Load Time', 'Bounce Rate', 'Conversion Rate', 'SEO Score'];
            const units = ['s', '%', '%', '/100'];
            return `${labels[context.dataIndex]}: ${context.parsed.y.toFixed(2)}${units[context.dataIndex]}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <Bar data={data} options={options} />
    </div>
  );
};

// Daily Traffic Chart
export const DailyTrafficChart = ({ dailyData }) => {
  const data = {
    labels: dailyData.map(item => `Day ${item.day}`),
    datasets: [
      {
        label: 'Daily Visitors',
        data: dailyData.map(item => item.visitors),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Daily Traffic Pattern (Last 30 Days)',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Visitors: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <Line data={data} options={options} />
    </div>
  );
};
