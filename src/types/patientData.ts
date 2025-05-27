export interface Patient {
  id?: string;
  nome: string;
  idade?: number;
  detalhes?: string;
}

export interface PacienteSession {
  id: string;
  BPM: {
    [key: number]: number;
  };
  EMG: {
    [key: number]: number;
  };
  distancia: number;
  pontuacao: number;
  velocidade: {
    [key: number]: number;
  };
  pista: string;
}
