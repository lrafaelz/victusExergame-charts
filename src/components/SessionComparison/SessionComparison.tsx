import React from 'react';
import { Box } from '@mui/material';
import { PacienteSession } from '../../types/patientData';
import { useSessionComparison } from './SessionComparison.functions';
import { SessionDetails } from './SessionDetails';
import { SessionSummary } from './SessionSummary';

interface SessionComparisonProps {
  sessions: PacienteSession[];
  pdfComparisonRef?: React.RefObject<HTMLDivElement>;
  pdfComparisonReady?: boolean;
}

const SessionComparison: React.FC<SessionComparisonProps> = ({
  sessions,
  pdfComparisonRef,
  pdfComparisonReady,
}) => {
  const { calcAvgSpeed, getFirstAndLastSession, calculateSpeedChange } =
    useSessionComparison(sessions);

  if (!sessions.length) {
    return null;
  }

  const { first, last } = getFirstAndLastSession();
  if (!first || !last) return null;

  const firstAvg = calcAvgSpeed(first);
  const lastAvg = calcAvgSpeed(last);
  const speedChange = calculateSpeedChange(firstAvg, lastAvg);

  return (
    <Box
      className="session-comparison-container"
      sx={{
        width: '100%',
        wordBreak: 'break-word',
      }}
    >
      <SessionSummary
        first={first}
        last={last}
        speedChange={speedChange}
        pdfComparisonRef={pdfComparisonRef}
        pdfComparisonReady={pdfComparisonReady}
      />
      <SessionDetails sessions={sessions} />
    </Box>
  );
};

export default SessionComparison;
