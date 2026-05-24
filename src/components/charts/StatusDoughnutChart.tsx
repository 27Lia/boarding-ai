'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  completed: number
  inProgress: number
  notStarted: number
  atRisk: number
}

export default function StatusDoughnutChart({ completed, inProgress, notStarted, atRisk }: Props) {
  const data = {
    labels: ['완료', '진행 중', '미시작', '위험'],
    datasets: [
      {
        data: [completed, inProgress, notStarted, atRisk],
        backgroundColor: ['#22c55e', '#6366f1', '#e5e7eb', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8 },
      },
    },
    cutout: '70%',
  }

  return <Doughnut data={data} options={options} />
}
