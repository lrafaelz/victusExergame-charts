import { getFirestore, collection, doc, getDocs, getDoc } from 'firebase/firestore';

const db = getFirestore();

/**
 * Retorna todos os fisioterapeutas cadastrados.
 * Considera que os dados ficam em: /VictusExergame/SRF/Fisioterapeutas
 */
export async function getAllFisioterapeutas() {
  const fisioterapeutasRef = collection(db, 'VictusExergame', 'SRF', 'Fisioterapeutas');
  const snapshot = await getDocs(fisioterapeutasRef);
  return snapshot.docs.map(document => ({
    email: document.id, // Supondo que o ID seja o email
    ...document.data(),
  }));
}

/**
 * Retorna os dados de um fisioterapeuta específico usando o seu email.
 * @param email - Email do fisioterapeuta, que é usado como ID do documento.
 */
export async function getFisioterapeutaByEmail(email: string) {
  const docRef = doc(db, 'VictusExergame', 'SRF', 'Fisioterapeutas', email);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}
