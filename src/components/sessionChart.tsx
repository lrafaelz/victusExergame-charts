import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface ReactApexChartProps {
  dataArray: number[]; // The array of values to plot
}

export const SessionChart: React.FC<ReactApexChartProps> = ({ dataArray }) => {
  // Create the series data with the given dataArray
  const series = [{
    name: "Values",
    data: dataArray
  }];

  // Generate the x-axis categories with intervals of  5
  const categories = Array.from({ length: Math.ceil(dataArray.length) }, (_, i) => i *  5);

  // Set up the chart options
  const options = {
    chart: {
      toolbar: {
        show: false // Hide the toolbar
      }
    },
    xaxis: {
      categories: categories // Use the generated categories
    },
    yaxis: {
      min:  0, // Start Y-axis at  0
      max: Math.max(...dataArray) // Set the maximum value of Y-axis based on the data
    }
  };

  // Render the chart
  return (
    <div className="chart">
      <ReactApexChart
        options={options}
        series={series}
        type="line" // Change to the desired chart type
        height={350}
      />
    </div>
  );
};


