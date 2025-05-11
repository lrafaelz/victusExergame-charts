import { UserInfo } from '../types/auth';
import db from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const fetchUserName = async (user: UserInfo) => {
  if (!user.email) return null;

  const userRef = doc(db, 'VictusExergame', 'SRF', 'Fisioterapeutas', user.email);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data().nome;
  } else {
    return null;
  }
};
