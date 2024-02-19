import { onSnapshot, doc, collection, getDocs } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import db from './firebase'
import { SessionsDropdown } from './components/sessionsDropdown'
import { GraphDataDropdown } from './components/graphDataDropdown'
import { SessionChart } from './components/sessionChart'



// Define os tipos de dados que esperamos obter do Firestore
interface SessionData {
  BPM: number[]
  EMG: number[]
  velocidade: number[]
  distancia: number
  pontuacao: number
  tempoDeSessao: number
}

export const App: React.FC = () => {
  
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [sessionTimestamps, setSessionTimestamps] = useState<string[]>([])
  const [selectedSession, setSelectedSession] = useState('Selecione uma sessão')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedGraphData, setSelectedGraphData] = useState('Selecione uma métrica')

  const getSelectedArray = (selectedSession: string) => {
    const session = sessions.find((session, index) => sessionTimestamps[index] === selectedSession)
    switch (selectedGraphData) {
      case 'BPM':
        return session?.BPM || []
      case 'EMG':
        return session?.EMG || []
      case 'Velocidade':
        return session?.velocidade || []
    }
    return []
  }

  // Função para lidar com a mudança de opção no dropdown
  const handleSessionSelect = (selectedOption: string, selectedIndex: number) => {
    setSelectedSession(selectedOption);
    setSelectedIndex(selectedIndex);
  };

  const handleGraphDataSelect = (option: string) => {
    setSelectedGraphData(option)
  }

  useEffect(() => {
    const patientRef = doc(db, 'PhysioGames', 'SRF', 'Pacientes', 'Rafael')
    const gameRef = doc(patientRef, 'Jogos', 'VictusExergame')
    const sessionsCollection = collection(gameRef, 'Sessoes')

    // Obter nomes das sessões
    const fetchSessionNames = async () => {
      const querySnapshot = await getDocs(sessionsCollection)
      const timestamps = querySnapshot.docs.map(doc => doc.id)
      console.log(timestamps)
      setSessionTimestamps(timestamps)
    }
    fetchSessionNames()

    // Obter dados das sessões
    const unsubscribe = onSnapshot(sessionsCollection, (snapshot) => {
      const updatedSessions: SessionData[] = snapshot.docs.map((doc) => {
        const data = doc.data() as SessionData // Cast the data to the expected type
        return data
      })
      console.log(updatedSessions)
      setSessions(updatedSessions)
    })

    // Limpar o listener quando o componente é desmontado
    return () => unsubscribe()
  }, [])

  return (
    
    <div className='mx-auto max-w-6xl my-12 space-y-6 px-5'>
      <h1 className='text-2xl font-bold'>Dados das sessões do jogo Vicuts Exergame</h1>
      <form className='w-full'>
        <div className='grid grid-cols-2 gap-2 place-content-center h-24'>
          <div className='text-center'>
            <SessionsDropdown
              options={sessionTimestamps}
              selectedOption={selectedSession}
              onOptionChange={handleSessionSelect}
            />
          </div>
          <div className='text-center'>
              <GraphDataDropdown
                options={['BPM', 'EMG', 'Velocidade']}
                selectedOption={selectedGraphData}
                onOptionChange={handleGraphDataSelect}
              />
          </div>
        </div>
          <div className='text-center'>
            <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded'>Gerar gráfico</button>
          </div>
        <div>            
          {/* Map over the sessions and display the data */}
          {sessions.map((session, index) => {
          const { BPM, EMG, velocidade, distancia, pontuacao, tempoDeSessao } = session
          return (
            <div key={index} className='border border-gray-200 rounded-md p-4 my-4'>
                <h2 className='text-lg font-bold'>Sessão {index + 1 + ': ' + sessionTimestamps[index]}</h2>
              <p>Distância: {distancia}</p>
              <p>Pontuação: {pontuacao}</p>
              <p>Tempo de sessão: {tempoDeSessao}</p>
              <p>BPM: {BPM.join(', ')}</p>
              <p>EMG: {EMG.join(', ')}</p>
              <p>Velocidade: {velocidade.join(', ')}</p>
            </div>
          )
        })}
        </div>
      </form>
      <div>
        <p>Valor selecionado em sessões: {selectedSession} e  seu respectivo índice: {selectedIndex}</p>
        <p>Valor selecionado em métricas: {selectedGraphData}</p>
        <p>Array de valores selecionados: {getSelectedArray(selectedSession)}</p>

        <SessionChart dataArray={getSelectedArray(selectedSession)} />
      </div>
    </div>
  )
}


