import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { SessionData } from '../utils/sessionData'
import Spinner from 'react-bootstrap/Spinner'

interface ReactApexChartProps {
  dataArray:  SessionData[] // The array of values to plot
}
interface SeriesItem {
  name: string;
  data: number[];
}

export const SessionChart: React.FC<ReactApexChartProps> = ({ dataArray }) => {
  const [seriesArray, setSeriesArray] = useState<SeriesItem[]>([])
  const [isLoading, setIsLoading] = useState(true);

  const setup = () => {
    const seriesSetupArray: SeriesItem[] = []
    for (let i = 0; i < dataArray.length; i++) {
      const BPMItem: SeriesItem = {
        name: 'BMP' + (i+1),
        data: dataArray[i]?.BPM ?? []
      }
      const EMGItem: SeriesItem = {
        name: 'EMG' + (i+1),
        data: dataArray[i]?.EMG ?? []
      }
      const velocidadeItem: SeriesItem = {
        name: 'Velocidade' + (i+1),
        data: dataArray[i]?.velocidade ?? []
      }
      seriesSetupArray.push(BPMItem, EMGItem, velocidadeItem)
    }
    console.log('Series setup array: ' + seriesSetupArray)
    setSeriesArray(seriesSetupArray)
  }
  // Create the series data with the given dataArray

  // Generate the x-axis categories with intervals of  5
  const categories = Array.from({ length: Math.ceil(dataArray[0].EMG?.length ?? 0) }, (_, i) => i *  5)

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
  }

  useEffect(() => {
    // Depois que os dados do gráfico são carregados, defina isLoading como false
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setup()
  }, [dataArray])

  // Render the chart
  return (
    <div className="chart">
      {isLoading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        ) : (
        <ReactApexChart
          options={options}
          series={seriesArray} 
          type='area' // Change to the desired chart type
          height={350}
        />
      )}

    </div>);
};


