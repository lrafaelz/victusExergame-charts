import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDLl_wQrSJRFzeYNLUSQEm8xOxmPKT2iA4',
  authDomain: 'victus-exergame.firebaseapp.com',
  databaseURL: 'https://victus-exergame-default-rtdb.firebaseio.com',
  projectId: 'victus-exergame',
  storageBucket: 'victus-exergame.appspot.com',
  messagingSenderId: '495418887892',
  appId: '1:495418887892:web:d84c5f2ceee988d273f541',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PACIENTES_PATH = ['VictusExergame', 'SRF', 'Pacientes'];

async function updateEMGValues() {
    const pacientes = ['2', 'Gidauí Tuchi Tegem', 'Mariano Buzo', 'Paulo Roberto Mohnsam Bastos', 'pacienteExemplo'];
    const pistas = ['PISTA 1', 'PISTA 2'];

    for (const pacienteId of pacientes) {
        for (const pista of pistas) {
            try {
                // Caminho para a coleção de sessões
                const pistaCollectionRef = collection(db, ...PACIENTES_PATH, pacienteId, pista);
                const sessionsSnapshot = await getDocs(pistaCollectionRef);

                if (sessionsSnapshot.empty) {
                    console.log(`Nenhuma sessão encontrada para paciente ${pacienteId} em ${pista}`);
                    continue;
                }

                for (const sessionDoc of sessionsSnapshot.docs) {
                    const sessionData = sessionDoc.data();
                    if (sessionData.EMG) {
                        const newEMG = {};
                        for (const key in sessionData.EMG) {
                            newEMG[key] = 0;
                        }
                        await updateDoc(sessionDoc.ref, { EMG: newEMG });
                        console.log(`EMG zerado para sessão ${sessionDoc.id} do paciente ${pacienteId} em ${pista}`);
                    }
                }
            } catch (error) {
                console.error(`Erro ao atualizar EMG do paciente ${pacienteId} em ${pista}:`, error);
            }
        }
    }
}

// Execute the function
updateEMGValues()
    .then(() => console.log('EMG values update completed'))
    .catch(error => console.error('Error in EMG values update:', error)); 