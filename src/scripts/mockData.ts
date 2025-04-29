import { doc, setDoc } from 'firebase/firestore';
import db from '../firebase';
import { Patient, PacienteSession } from '../types/patientData';
import { Fisioterapeuta } from '../types/fisioterapeutaData';

// Caminho para as coleções
const PACIENTES_PATH = ['VictusExergame', 'SRF', 'Pacientes'];
const FISIOTERAPEUTAS_PATH = ['VictusExergame', 'SRF', 'Fisioterapeutas'];

// Dados mocados para pacientes
const mockPacientes: Patient[] = [
  {
    id: '1',
    nome: 'Paciente Exemplo 1',
    idade: 50,
  },
  {
    id: '2',
    nome: 'Paciente Exemplo 2',
    idade: 45,
  },
  {
    id: '3',
    nome: 'Paciente Exemplo 3',
    idade: 62,
  },
];

// Dados mocados para sessões de pacientes (Pista1)
const mockSessoes: Record<string, PacienteSession[]> = {
  '1': [
    {
      id: 'session-1-1',
      BPM: {
        // Em repouso: 65-75 BPM
        0: 72, // 0s - início (repouso)
        1: 73, // 5s
        2: 75, // 10s
        3: 78, // 15s - começo do exercício leve
        4: 82, // 20s
        5: 87, // 25s
        6: 92, // 30s
        7: 98, // 35s - aumento da intensidade
        8: 103, // 40s
        9: 108, // 45s
        10: 112, // 50s
        11: 118, // 55s - pico de intensidade
        12: 122, // 60s (1min)
        13: 125, // 1min5s
        14: 128, // 1min10s - platô de exercício
        15: 129, // 1min15s
        16: 130, // 1min20s
        17: 132, // 1min25s
        18: 132, // 1min30s
        19: 134, // 1min35s
        20: 135, // 1min40s
        21: 136, // 1min45s
        22: 137, // 1min50s
        23: 138, // 1min55s
        24: 138, // 2min
        25: 139, // 2min5s
        26: 140, // 2min10s
        27: 141, // 2min15s
        28: 142, // 2min20s
        29: 142, // 2min25s
        30: 143, // 2min30s - pico máximo
        31: 143, // 2min35s
        32: 142, // 2min40s
        33: 141, // 2min45s - começo da redução gradual
        34: 140, // 2min50s
        35: 138, // 2min55s
        36: 136, // 3min
        37: 134, // 3min5s
        38: 132, // 3min10s
        39: 130, // 3min15s
        40: 128, // 3min20s
        41: 125, // 3min25s
        42: 123, // 3min30s
        43: 120, // 3min35s
        44: 117, // 3min40s
        45: 115, // 3min45s
        46: 112, // 3min50s
        47: 110, // 3min55s
        48: 108, // 4min
        49: 105, // 4min5s
        50: 103, // 4min10s
        51: 100, // 4min15s
        52: 98, // 4min20s - fase de recuperação
        53: 95, // 4min25s
        54: 93, // 4min30s
        55: 90, // 4min35s
        56: 88, // 4min40s
        57: 85, // 4min45s
        58: 83, // 4min50s
        59: 80, // 4min55s
        60: 78, // 5min - final da sessão
      },
      EMG: {
        // Atividade muscular (microvolts)
        0: 5.2, // repouso
        1: 5.5,
        2: 6.8,
        3: 12.5, // início do exercício
        4: 38.7,
        5: 75.2,
        6: 110.5,
        7: 185.3, // aumento da atividade
        8: 248.6,
        9: 310.4,
        10: 375.8,
        11: 420.6,
        12: 480.2, // 1min
        13: 520.5,
        14: 550.8,
        15: 575.3,
        16: 612.7,
        17: 640.2,
        18: 655.8,
        19: 680.3,
        20: 698.5,
        21: 710.2,
        22: 725.6,
        23: 738.9,
        24: 748.5, // 2min
        25: 758.2,
        26: 765.8,
        27: 772.3,
        28: 780.5,
        29: 785.2,
        30: 792.8, // pico
        31: 790.5,
        32: 788.2,
        33: 783.5,
        34: 775.8,
        35: 765.3,
        36: 748.6, // 3min
        37: 732.4,
        38: 715.8,
        39: 698.5,
        40: 675.2,
        41: 650.8,
        42: 628.5,
        43: 605.3,
        44: 582.6,
        45: 558.9,
        46: 532.5,
        47: 508.2,
        48: 482.5, // 4min
        49: 458.3,
        50: 430.6,
        51: 400.2,
        52: 372.5,
        53: 340.8,
        54: 310.5,
        55: 280.2,
        56: 250.6,
        57: 218.3,
        58: 185.2,
        59: 152.6,
        60: 120.3, // final
      },
      distancia: 1.85, // km percorridos na bicicleta ergométrica
      pontuacao: 820, // pontuação baseada na performance
      velocidade: {
        // Velocidade em km/h
        0: 0, // repouso
        1: 0.5, // início do movimento
        2: 2.8,
        3: 4.2,
        4: 6.5,
        5: 8.3,
        6: 10.2,
        7: 12.5, // aumento do ritmo
        8: 13.8,
        9: 15.2,
        10: 16.5,
        11: 17.2,
        12: 18.5, // 1min
        13: 19.2,
        14: 19.8,
        15: 20.3,
        16: 20.8,
        17: 21.2,
        18: 21.5,
        19: 21.8,
        20: 22.2,
        21: 22.4,
        22: 22.6,
        23: 22.8,
        24: 23.0, // 2min
        25: 23.2,
        26: 23.4,
        27: 23.5,
        28: 23.6,
        29: 23.8,
        30: 24.0, // velocidade máxima
        31: 23.8,
        32: 23.5,
        33: 23.2,
        34: 22.8,
        35: 22.4,
        36: 22.0, // 3min
        37: 21.6,
        38: 21.2,
        39: 20.8,
        40: 20.5,
        41: 20.2,
        42: 19.8,
        43: 19.5,
        44: 19.2,
        45: 18.8,
        46: 18.5,
        47: 18.2,
        48: 17.8, // 4min
        49: 17.2,
        50: 16.5,
        51: 15.8,
        52: 15.0,
        53: 14.2,
        54: 13.5,
        55: 12.8,
        56: 11.5,
        57: 10.2,
        58: 8.5,
        59: 6.2,
        60: 4.0, // desaceleração final
      },
    },
    {
      id: 'session-1-2',
      BPM: {
        // Sessão com intensidade um pouco maior
        0: 75, // repouso
        1: 78,
        2: 82,
        3: 86,
        4: 92,
        5: 98,
        6: 105,
        7: 112,
        8: 118,
        9: 123,
        10: 128,
        11: 133,
        12: 137, // 1min
        13: 140,
        14: 142,
        15: 144,
        16: 146,
        17: 147,
        18: 148,
        19: 150,
        20: 151,
        21: 152,
        22: 153,
        23: 154,
        24: 155, // 2min - platô
        25: 155,
        26: 156,
        27: 156,
        28: 156,
        29: 157,
        30: 157, // pico
        31: 157,
        32: 156,
        33: 155,
        34: 154,
        35: 152,
        36: 150, // 3min
        37: 147,
        38: 145,
        39: 142,
        40: 139,
        41: 136,
        42: 133,
        43: 130,
        44: 127,
        45: 124,
        46: 121,
        47: 118,
        48: 115, // 4min
        49: 112,
        50: 108,
        51: 105,
        52: 102,
        53: 98,
        54: 95,
        55: 92,
        56: 88,
        57: 85,
        58: 82,
        59: 80,
        60: 78, // final
      },
      EMG: {
        // Valores mais altos, indicando paciente com melhor condicionamento
        0: 8.5,
        1: 15.2,
        2: 45.6,
        3: 120.3,
        4: 195.8,
        5: 280.5,
        6: 350.2,
        7: 420.6,
        8: 480.5,
        9: 530.3,
        10: 580.6,
        11: 620.3,
        12: 650.5, // 1min
        13: 680.2,
        14: 700.8,
        15: 720.5,
        16: 740.2,
        17: 755.8,
        18: 770.3,
        19: 782.5,
        20: 795.8,
        21: 805.3,
        22: 815.6,
        23: 825.2,
        24: 835.8, // 2min
        25: 842.5,
        26: 850.2,
        27: 855.8,
        28: 860.5,
        29: 865.2,
        30: 870.5, // pico
        31: 868.2,
        32: 865.8,
        33: 860.5,
        34: 852.3,
        35: 840.8,
        36: 825.5, // 3min
        37: 810.2,
        38: 792.5,
        39: 775.8,
        40: 758.2,
        41: 738.5,
        42: 718.2,
        43: 698.5,
        44: 675.2,
        45: 650.8,
        46: 625.3,
        47: 600.5,
        48: 575.2, // 4min
        49: 550.5,
        50: 520.8,
        51: 490.5,
        52: 458.2,
        53: 425.8,
        54: 390.2,
        55: 350.8,
        56: 310.5,
        57: 270.2,
        58: 230.5,
        59: 190.8,
        60: 150.2, // final
      },
      distancia: 2.12, // km percorridos (melhora em relação à primeira sessão)
      pontuacao: 920,
      velocidade: {
        0: 0, // repouso
        1: 1.2,
        2: 3.8,
        3: 6.5,
        4: 9.2,
        5: 12.5,
        6: 15.2,
        7: 17.5,
        8: 19.2,
        9: 20.5,
        10: 21.8,
        11: 22.5,
        12: 23.2, // 1min
        13: 23.8,
        14: 24.2,
        15: 24.5,
        16: 24.8,
        17: 25.2,
        18: 25.5,
        19: 25.8,
        20: 26.0,
        21: 26.2,
        22: 26.3,
        23: 26.4,
        24: 26.5, // 2min - platô de velocidade máxima
        25: 26.5,
        26: 26.6,
        27: 26.6,
        28: 26.7,
        29: 26.8,
        30: 26.8, // velocidade máxima
        31: 26.7,
        32: 26.5,
        33: 26.2,
        34: 25.8,
        35: 25.4,
        36: 25.0, // 3min
        37: 24.5,
        38: 24.0,
        39: 23.5,
        40: 23.0,
        41: 22.5,
        42: 22.0,
        43: 21.4,
        44: 20.8,
        45: 20.2,
        46: 19.5,
        47: 18.8,
        48: 18.0, // 4min
        49: 17.2,
        50: 16.4,
        51: 15.6,
        52: 14.8,
        53: 13.5,
        54: 12.2,
        55: 10.8,
        56: 9.2,
        57: 7.5,
        58: 6.0,
        59: 4.5,
        60: 3.0, // final
      },
    },
  ],
  '2': [
    {
      id: 'session-2-1',
      BPM: {
        // Paciente com condicionamento intermediário
        0: 80, // repouso (ligeiramente elevado)
        1: 84,
        2: 88,
        3: 92,
        4: 97,
        5: 102,
        6: 108,
        7: 114,
        8: 120,
        9: 124,
        10: 128,
        11: 132,
        12: 135, // 1min
        13: 138,
        14: 140,
        15: 142,
        16: 144,
        17: 145,
        18: 146,
        19: 147,
        20: 148,
        21: 149,
        22: 150,
        23: 150,
        24: 151, // 2min
        25: 151,
        26: 152,
        27: 152,
        28: 152,
        29: 153,
        30: 153, // pico
        31: 152,
        32: 152,
        33: 151,
        34: 150,
        35: 148,
        36: 146, // 3min
        37: 144,
        38: 142,
        39: 139,
        40: 136,
        41: 134,
        42: 131,
        43: 128,
        44: 126,
        45: 123,
        46: 120,
        47: 118,
        48: 115, // 4min
        49: 112,
        50: 110,
        51: 107,
        52: 104,
        53: 102,
        54: 99,
        55: 97,
        56: 94,
        57: 92,
        58: 89,
        59: 87,
        60: 85, // final (retorno próximo ao repouso)
      },
      EMG: {
        // Atividade muscular menos intensa que paciente 1
        0: 7.8,
        1: 12.4,
        2: 35.6,
        3: 85.2,
        4: 140.5,
        5: 195.8,
        6: 250.2,
        7: 300.5,
        8: 350.2,
        9: 390.5,
        10: 425.8,
        11: 450.2,
        12: 472.5, // 1min
        13: 490.2,
        14: 505.8,
        15: 520.5,
        16: 532.8,
        17: 545.2,
        18: 555.8,
        19: 565.2,
        20: 575.8,
        21: 584.2,
        22: 592.5,
        23: 600.2,
        24: 605.8, // 2min
        25: 612.5,
        26: 618.2,
        27: 622.5,
        28: 625.8,
        29: 628.2,
        30: 630.5, // pico
        31: 628.2,
        32: 625.5,
        33: 620.8,
        34: 615.2,
        35: 608.5,
        36: 600.2, // 3min
        37: 590.5,
        38: 580.2,
        39: 568.5,
        40: 555.2,
        41: 540.8,
        42: 525.2,
        43: 510.5,
        44: 495.2,
        45: 478.5,
        46: 460.2,
        47: 440.5,
        48: 420.2, // 4min
        49: 398.5,
        50: 375.2,
        51: 350.8,
        52: 325.2,
        53: 298.5,
        54: 270.2,
        55: 240.5,
        56: 210.2,
        57: 180.5,
        58: 150.2,
        59: 120.5,
        60: 95.2, // final
      },
      distancia: 1.62, // km
      pontuacao: 720,
      velocidade: {
        0: 0, // repouso
        1: 0.8,
        2: 2.5,
        3: 4.8,
        4: 7.2,
        5: 9.5,
        6: 11.8,
        7: 13.5,
        8: 15.2,
        9: 16.8,
        10: 18.2,
        11: 19.5,
        12: 20.2, // 1min
        13: 20.8,
        14: 21.2,
        15: 21.5,
        16: 21.8,
        17: 22.0,
        18: 22.2,
        19: 22.4,
        20: 22.5,
        21: 22.6,
        22: 22.8,
        23: 22.9,
        24: 23.0, // 2min
        25: 23.0,
        26: 23.1,
        27: 23.2,
        28: 23.2,
        29: 23.3,
        30: 23.3, // velocidade máxima
        31: 23.2,
        32: 23.0,
        33: 22.8,
        34: 22.5,
        35: 22.2,
        36: 21.8, // 3min
        37: 21.5,
        38: 21.0,
        39: 20.5,
        40: 20.0,
        41: 19.5,
        42: 19.0,
        43: 18.5,
        44: 18.0,
        45: 17.4,
        46: 16.8,
        47: 16.2,
        48: 15.5, // 4min
        49: 14.8,
        50: 14.0,
        51: 13.2,
        52: 12.5,
        53: 11.8,
        54: 10.5,
        55: 9.2,
        56: 8.0,
        57: 6.8,
        60: 3.0, // final
      },
    },
  ],
  '3': [
    {
      id: 'session-3-1',
      BPM: {
        // Paciente com condicionamento mais limitado (pessoa mais idosa)
        0: 78, // repouso
        1: 82,
        2: 85,
        3: 88,
        4: 92,
        5: 96,
        6: 100,
        7: 104,
        8: 107,
        9: 110,
        10: 112,
        11: 115,
        12: 117, // 1min
        13: 119,
        14: 120,
        15: 122,
        16: 123,
        17: 124,
        18: 125,
        19: 126,
        20: 127,
        21: 128,
        22: 128,
        23: 129,
        24: 130, // 2min
        25: 130,
        26: 131,
        27: 131,
        28: 132,
        29: 132,
        30: 132, // pico (mais baixo que outros pacientes)
        31: 132,
        32: 131,
        33: 130,
        34: 129,
        35: 128,
        36: 127, // 3min
        37: 126,
        38: 124,
        39: 123,
        40: 121,
        41: 119,
        42: 117,
        43: 115,
        44: 113,
        45: 111,
        46: 109,
        47: 107,
        48: 105, // 4min
        49: 103,
        50: 101,
        51: 99,
        52: 97,
        53: 95,
        54: 93,
        55: 91,
        56: 89,
        57: 87,
        58: 85,
        59: 83,
        60: 81, // final
      },
      EMG: {
        // Atividade muscular reduzida
        0: 5.2,
        1: 8.5,
        2: 18.2,
        3: 45.8,
        4: 85.2,
        5: 120.5,
        6: 150.2,
        7: 180.5,
        8: 210.2,
        9: 235.5,
        10: 255.2,
        11: 272.5,
        12: 285.2, // 1min
        13: 295.5,
        14: 305.2,
        15: 312.5,
        16: 320.2,
        17: 327.5,
        18: 332.8,
        19: 338.2,
        20: 342.5,
        21: 346.8,
        22: 350.2,
        23: 353.5,
        24: 356.2, // 2min
        25: 358.5,
        26: 360.2,
        27: 362.5,
        28: 363.8,
        29: 364.5,
        30: 365.2, // pico
        31: 364.5,
        32: 362.8,
        33: 360.2,
        34: 357.5,
        35: 354.2,
        36: 350.5, // 3min
        37: 345.2,
        38: 340.5,
        39: 335.2,
        40: 328.5,
        41: 320.2,
        42: 312.5,
        43: 305.2,
        44: 295.5,
        45: 285.2,
        46: 275.5,
        47: 265.2,
        48: 255.5, // 4min
        49: 242.8,
        50: 228.5,
        51: 215.2,
        52: 200.5,
        53: 185.2,
        54: 170.5,
        55: 155.2,
        56: 140.5,
        57: 125.2,
        58: 110.5,
        59: 95.2,
        60: 80.5, // final
      },
      distancia: 1.25, // distância menor devido às limitações
      pontuacao: 580,
      velocidade: {
        0: 0, // repouso
        1: 0.5,
        2: 1.8,
        3: 3.2,
        4: 5.5,
        5: 7.2,
        6: 8.8,
        7: 10.2,
        8: 11.5,
        9: 12.8,
        10: 13.5,
        11: 14.2,
        12: 14.8, // 1min
        13: 15.2,
        14: 15.5,
        15: 15.8,
        16: 16.0,
        17: 16.2,
        18: 16.4,
        19: 16.5,
        20: 16.6,
        21: 16.8,
        22: 16.9,
        23: 17.0,
        24: 17.0, // 2min
        25: 17.1,
        26: 17.1,
        27: 17.2,
        28: 17.2,
        29: 17.3,
        30: 17.3, // velocidade máxima (menor que outros pacientes)
        31: 17.2,
        32: 17.1,
        33: 17.0,
        34: 16.8,
        35: 16.5,
        36: 16.2, // 3min
        37: 15.8,
        38: 15.5,
        39: 15.0,
        40: 14.6,
        41: 14.2,
        42: 13.8,
        43: 13.4,
        44: 13.0,
        45: 12.5,
        46: 12.0,
        47: 11.5,
        48: 11.0, // 4min
        49: 10.5,
        50: 10.0,
        51: 9.4,
        52: 8.8,
        53: 8.2,
        54: 7.5,
        55: 6.8,
        56: 6.0,
        57: 5.2,
        58: 4.5,
        59: 3.8,
        60: 3.0, // final
      },
    },
  ],
};

// Dados mocados para fisioterapeutas
const mockFisioterapeutas: Fisioterapeuta[] = [
  {
    email: 'teste@mail.com',
    loginHistory: {
      0: '2025-04-08T19:57:37.631Z',
    },
    nome: 'teste',
    uid: 'vKucDUgDhdNpct6WmnBsTkfflQc2',
  },
  {
    email: 'fisio1@exemplo.com',
    loginHistory: {
      0: '2025-04-07T14:30:00.000Z',
    },
    nome: 'Fisioterapeuta 1',
    uid: 'fisioUID123456789',
  },
];

/**
 * Adiciona pacientes mocados ao Firestore
 */
export async function addMockPacientes() {
  try {
    for (const paciente of mockPacientes) {
      const pacienteId = paciente.id || `paciente-${Date.now()}`;
      const pacienteRef = doc(
        db,
        PACIENTES_PATH[0],
        PACIENTES_PATH[1],
        PACIENTES_PATH[2],
        pacienteId,
      );

      // Remover o campo ID antes de salvar no Firestore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...pacienteData } = paciente;

      await setDoc(pacienteRef, pacienteData);
      console.log(`Paciente ${pacienteId} adicionado com sucesso`);

      // Adicionar as sessões (Pista1) para este paciente, se existirem
      if (mockSessoes[pacienteId]) {
        const sessoes = mockSessoes[pacienteId];
        for (let i = 0; i < sessoes.length; i++) {
          const sessao = sessoes[i];
          // Criar timestamps diferentes para cada sessão
          const hoje = new Date();
          // Cada sessão será um dia diferente (diminuindo i dias da data atual)
          const dataHora = new Date(hoje);
          dataHora.setDate(hoje.getDate() - i);

          // Formatar a data como no exemplo: 2-29-2024 8:37:50 AM
          const dataFormatada = `${
            dataHora.getMonth() + 1
          }-${dataHora.getDate()}-${dataHora.getFullYear()} ${dataHora.getHours()}:${dataHora.getMinutes()}:${dataHora.getSeconds()} ${
            dataHora.getHours() >= 12 ? 'PM' : 'AM'
          }`;

          const sessaoRef = doc(
            db,
            PACIENTES_PATH[0],
            PACIENTES_PATH[1],
            PACIENTES_PATH[2],
            pacienteId,
            'Pista1',
            dataFormatada,
          );
          await setDoc(sessaoRef, sessao);
          console.log(`Sessão ${dataFormatada} adicionada para o paciente ${pacienteId}`);
        }
      }
    }

    console.log('Todos os pacientes e sessões foram adicionados com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar pacientes mocados:', error);
    return false;
  }
}

/**
 * Adiciona fisioterapeutas mocados ao Firestore
 */
export async function addMockFisioterapeutas() {
  try {
    for (const fisio of mockFisioterapeutas) {
      const fisioRef = doc(
        db,
        FISIOTERAPEUTAS_PATH[0],
        FISIOTERAPEUTAS_PATH[1],
        FISIOTERAPEUTAS_PATH[2],
        fisio.email,
      );
      await setDoc(fisioRef, fisio);
      console.log(`Fisioterapeuta ${fisio.email} adicionado com sucesso`);
    }

    console.log('Todos os fisioterapeutas foram adicionados com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar fisioterapeutas mocados:', error);
    return false;
  }
}

/**
 * Adiciona todos os dados mocados ao Firestore
 */
export async function addAllMockData() {
  await addMockPacientes();
  await addMockFisioterapeutas();
  console.log('Todos os dados mocados foram adicionados com sucesso!');
}

// Você pode exportar esta função como padrão para facilitar a importação
export default addAllMockData;
