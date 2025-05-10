import { PacienteSession } from '../../types/patientData';

export const useSessionComparison = (sessions: PacienteSession[]) => {
  const calcAvgSpeed = (session: PacienteSession) => {
    const values = Object.values(session.velocidade);
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  const getFirstAndLastSession = () => {
    if (!sessions.length) return { first: null, last: null };
    return {
      first: sessions[0],
      last: sessions[sessions.length - 1],
    };
  };

  const calculateSpeedChange = (firstAvg: number, lastAvg: number) => {
    return ((lastAvg - firstAvg) / firstAvg) * 100;
  };

  return {
    calcAvgSpeed,
    getFirstAndLastSession,
    calculateSpeedChange,
  };
};
