import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { Patient } from '../types/patientData';
import db from '../firebase';

/**
 * Retorna todos os pacientes cadastrados.
 * Considera que os dados ficam em: /VictusExergame/SRF/Pacientes
 */
export async function getAllPacientes(): Promise<Patient[]> {
  const pacientesRef = collection(db, 'VictusExergame', 'SRF', 'Pacientes');
  const snapshot = await getDocs(pacientesRef);
  return snapshot.docs.map(document => ({
    id: document.id,
    nome: document.data().nome || document.id,
    idade: document.data().idade || 0,
    detalhes: document.data().detalhes || '',
  }));
}

/**
 * Retorna os dados de um paciente específico.
 * @param pacienteId - ID do paciente (nome do documento).
 */
export async function getPaciente(pacienteId: string) {
  const pacienteRef = doc(db, 'VictusExergame', 'SRF', 'Pacientes', pacienteId);
  const snapshot = await getDoc(pacienteRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

/**
 * Retorna todos os registros da subcoleção "Pista1" de um paciente específico.
 * Cada documento nesta subcoleção representa uma sessão/registro de atividade.
 * @param pacienteId - ID do paciente.
 */
export async function getPacientePista(pacienteId: string) {
  const pistaRef = collection(db, 'VictusExergame', 'SRF', 'Pacientes', pacienteId, 'Pista1');
  const snapshot = await getDocs(pistaRef);
  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }));
}

/**
 * Retorna os dados de uma sessão específica dentro da subcoleção "Pista1".
 * @param pacienteId - ID do paciente.
 * @param dataSessao - ID do documento na subcoleção (por exemplo, uma string que representa a data da sessão)
 */
export async function getPacientePistaByDate(pacienteId: string, dataSessao: string) {
  const pistaDocRef = doc(
    db,
    'VictusExergame',
    'SRF',
    'Pacientes',
    pacienteId,
    'Pista1',
    dataSessao,
  );
  const snapshot = await getDoc(pistaDocRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}
