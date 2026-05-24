'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function StepDropoffBarChart() {
  const data = {
    labels: ['계정 설정', '팀원 초대', '첫 프로젝트', '연동 설정', '알림 설정'],
    datasets: [
      {
        label: '완료 고객 수',
        data: [87, 72, 61, 44, 38],
        backgroundColor: '#6366f1',
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: '#f3f4f6' }, ticks: { stepSize: 20 } },
      x: { grid: { display: false } },
    },
  }

  return <Bar data={data} options={options} />
}
