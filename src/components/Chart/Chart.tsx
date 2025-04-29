import { LineChart } from '@mui/x-charts/LineChart';

const data = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 50 },
  // Adicione mais dados conforme necessário
];

const Chart = () => (
  <LineChart
    series={[{ data: data.map(point => point.y) }]}
    xAxis={[{ data: data.map(point => point.x), scaleType: 'band' }]}
    yAxis={[{ dataKey: 'y' }]}
    height={300}
    width={500}
  />
);

export default Chart;
