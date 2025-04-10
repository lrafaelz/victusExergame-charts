export interface Patient {
  id?: string;
  nome?: string;
  idade?: number;
}

export interface PacienteSession {
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
}
