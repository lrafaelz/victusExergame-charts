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
 * Retorna a lista de nomes das pistas disponíveis para um paciente.
 * @param pacienteId - O ID do documento do paciente.
 * @returns Uma Promise que resolve para um array de strings com os nomes das pistas.
 */
async function getPistasDisponiveis(pacienteId: string): Promise<string[] | null> {
  const pacienteRef = doc(db, 'VictusExergame', 'SRF', 'Pacientes', pacienteId);
  const snapshot = await getDoc(pacienteRef);

  if (snapshot.exists()) {
    const dadosPaciente = snapshot.data();
    // Retorna o array 'pistasDisponiveis' ou um array vazio se o campo não existir
    return dadosPaciente.pistasDisponiveis || [];
  }

  console.log('Paciente não encontrado!');
  return null;
}

/**
 * Busca todas as sessões de todas as pistas de um paciente específico.
 * Adiciona um campo 'pista' em cada objeto de sessão para identificação.
 * @param pacienteId - O ID do documento do paciente.
 * @returns Uma Promise que resolve para um array com todos os objetos de sessão.
 */
export async function getAllSessionsByPatient(pacienteId: string) {
  // 1. Primeiro, obtemos a lista de nomes das pistas disponíveis.
  const pistas = await getPistasDisponiveis(pacienteId);

  // Se o paciente não tiver pistas, retorna um array vazio.
  if (!pistas || pistas.length === 0) {
    console.log(`Nenhuma pista encontrada para o paciente ${pacienteId}`);
    return [];
  }

  // 2. Criamos um array de "promessas". Cada promessa é uma consulta
  // para buscar os documentos de uma subcoleção de pista.
  const promises = pistas.map(pistaName => {
    const pistaRef = collection(db, 'VictusExergame', 'SRF', 'Pacientes', pacienteId, pistaName);
    return getDocs(pistaRef);
  });

  // 3. Executamos todas as promessas em paralelo e esperamos a conclusão de todas.
  const results = await Promise.all(promises);

  // 4. Agora, processamos os resultados. 'results' é um array de Snapshots.
  // Usamos flatMap para achatar o array de arrays e formatar os dados.
  const allSessions = results.flatMap((snapshot, index) => {
    // Pegamos o nome da pista correspondente a este resultado
    const pistaName = pistas[index];

    // Mapeamos cada documento da sessão, adicionando o ID e o nome da pista
    return snapshot.docs.map(document => ({
      id: document.id, // O ID do documento da sessão (ex: a data)
      pista: pistaName, // <-- AQUI ADICIONAMOS A PISTA AO OBJETO
      ...document.data(), // Todos os outros dados da sessão (distancia, tempo, etc.)
    }));
  });

  console.log(allSessions);

  return allSessions;
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
