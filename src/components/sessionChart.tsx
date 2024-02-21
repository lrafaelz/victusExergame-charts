import React from 'react'
import ReactApexChart from 'react-apexcharts'
import { SessionData } from '../app'

interface ReactApexChartProps {
  dataArray:  SessionData // The array of values to plot
}

export const SessionChart: React.FC<ReactApexChartProps> = ({ dataArray }) => {
  // Create the series data with the given dataArray
  const series = [{
    name: 'BMP',
    data: dataArray?.BPM ?? []
  },
  {
    name: 'EMG',
    data: dataArray?.EMG ?? []
  },
  {
    name: 'Velocidade',
    data: dataArray?.velocidade ?? []
  }
];

  // Generate the x-axis categories with intervals of  5
  const categories = Array.from({ length: Math.ceil(dataArray.EMG?.length ?? 0) }, (_, i) => i *  5)

  // Set up the chart options
  const options = {
    chart: {
      toolbar: {
        show: false // Hide the toolbar
      }
    },
    // stroke: {
    //   curve: 'smooth' // curve: ['straight', 'smooth', 'monotoneCubic', 'stepline']
    // },
    xaxis: {
      categories: categories // Use the generated categories
    },
    dataLabels: {
      enabled: false
    }
  };

  // Render the chart
  return (
    <div className="chart">
      <ReactApexChart
        options={options}
        series={series}
        type='area' // Change to the desired chart type
        height={350}
      />
    </div>
  );
};


