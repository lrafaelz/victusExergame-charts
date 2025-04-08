import { Box, Typography } from "@mui/material";
import { SessionData } from "../utils/sessionData";

interface PatientDataWrittenProps {
  session: SessionData;
  selectedSession: string;
  index: number;
}

export const PatientDataWritten: React.FC<PatientDataWrittenProps> = ({
  session,
  selectedSession,
  index,
}) => {
  return (
    <Box
      key={index}
      sx={{ border: 1, borderColor: "gray.200", borderRadius: 1, p: 4, my: 4 }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Informações por escrito da sessão:{" "}
        <Box component="span" sx={{ fontWeight: "black" }}>
          {selectedSession}
        </Box>
      </Typography>
      <p>Distância: {session.distancia}</p>
      <Typography sx={{ bgcolor: "gray.200" }}>
        Pontuação: {session.pontuacao}
      </Typography>
      <p>Tempo de sessão: {session.tempoDeSessao}</p>
      <Typography sx={{ bgcolor: "gray.200" }}>
        EMG: {session.EMG?.join(", ")}
      </Typography>
      <p>BPM: {session.BPM?.join(", ")}</p>
      <Typography sx={{ bgcolor: "gray.200" }}>
        Velocidade: {session.velocidade?.join(", ")}
      </Typography>
    </Box>
  );
};
