'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const labels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월']

export default function CompletionLineChart() {
  const data = {
    labels,
    datasets: [
      {
        label: '온보딩 완료율 (%)',
        data: [42, 51, 58, 63, 71, 75, 82],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v: number | string) => `${v}%` },
        grid: { color: '#f3f4f6' },
      },
      x: { grid: { display: false } },
    },
  }

  return <Line data={data} options={options} />
}
