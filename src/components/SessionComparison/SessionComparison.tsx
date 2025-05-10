import React, { useRef } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { PacienteSession } from '../../types/patientData';
import TrendingFlatRounded from '@mui/icons-material/TrendingFlatRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSessionComparison } from './SessionComparison.functions';
import { SessionSummary } from './SessionSummary';
import { SessionDetails } from './SessionDetails';

interface SessionComparisonProps {
  sessions: PacienteSession[];
}

const SessionComparison: React.FC<SessionComparisonProps> = ({ sessions }) => {
  const comparisonRef = useRef<HTMLDivElement>(null);
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
    <Box ref={comparisonRef} className="session-comparison-container">
      <SessionSummary first={first} last={last} speedChange={speedChange} />
      <SessionDetails sessions={sessions} />
    </Box>
  );
};

export default SessionComparison;
