import { onSnapshot, doc, collection, getDocs, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import db from './firebase'
import { SessionsDropdown } from './components/sessionsDropdown'
import { PatientNamesDropdown } from './components/patientNamesDropdown'
import { SessionChart } from './components/sessionChart'
import { PatientDataWritten } from './components/patientDataWritten'
import { set } from 'firebase/database'



// Define os tipos de dados que esperamos obter do Firestore
export interface SessionData {
  BPM?: number[]
  EMG?: number[]
  velocidade?: number[]
  distancia?: number
  pontuacao?: number
  tempoDeSessao?: number
}

export const App: React.FC = () => {
  
  const [session, setSession] = useState<SessionData>({})
  const [sessionTimestamps, setSessionTimestamps] = useState<string[]>([])
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0)

  const [patientNames, setPatientName] = useState<string[]>([])
  const [selectedPatientName, setSelectedPatientName] = useState('')

  const [submitForm, setSubmitForm] = useState(false)

  // const getSelectedSession = (selectedSession: string) => {
  //   const session = sessions.find((session, index) => sessionTimestamps[index] === selectedSession)
  //   // console.log(session.Object.value || [])
  //   console.log(session)
  //   return session
  // }

  // Função para lidar com a mudança de opção no dropdown
  const handleSessionSelect = (selectedOption: string, selectedIndex: number) => {
    setSelectedSession(selectedOption)
    setSelectedSessionIndex(selectedIndex)
  };
  
  const handleSelectedPatientName = (selectedOption: string) => {
    setSelectedPatientName(selectedOption)
    setSelectedSession('')
  }

  const SRFRef = doc(db, 'PhysioGames', 'SRF')
  const patientCollection = collection(SRFRef, 'Pacientes')

  // Obter nome dos pacientes
  const fetchPatientNames = async () => {
    const querySnapshot = await getDocs(patientCollection)
    const firebasePatientNames = querySnapshot.docs.map(doc => doc.id)
    console.log('Nomes dos pacientes firebase: ' + firebasePatientNames)
    setPatientName(firebasePatientNames)
  }

  // Obter nomes das sessões
  const fetchSessionNames = async () => {
    console.log('Nome do paciente selecionado: ' + selectedPatientName)
    const selectedPatientRef = doc(patientCollection, selectedPatientName)
    const sessionsCollection = collection(selectedPatientRef, 'Jogos', 'VictusExergame', 'Sessoes')
    const querySnapshot = await getDocs(sessionsCollection)
    const timestamps = querySnapshot.docs.map(doc => doc.id)
    console.log(timestamps)
    setSessionTimestamps(timestamps)
  }

  const handleButtonSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitForm(true)
  }

  const fetchSessionData = async () => {
    const sessionRef = doc(patientCollection, selectedPatientName, 'Jogos', 'VictusExergame', 'Sessoes', selectedSession)
    const docSnapshot = await getDoc(sessionRef)
    if(docSnapshot.exists()) {
      console.log('Document data:', docSnapshot.data())
      const sessionData: SessionData = {
        BPM: docSnapshot.data().BPM,
        EMG: docSnapshot.data().EMG,
        velocidade: docSnapshot.data().velocidade,
        distancia: docSnapshot.data().distancia,
        pontuacao: docSnapshot.data().pontuacao,
        tempoDeSessao: docSnapshot.data().tempoDeSessao
      }
      return setSession(sessionData)
    }else{
      console.log('No such document!')
    }


  } 
  
  useEffect(() => {
    fetchPatientNames()
    if (selectedPatientName) fetchSessionNames()
    if(selectedSession) fetchSessionData()
  }, [selectedPatientName, selectedSession])
  

  // console.log(sessions)
  return (
    
    <div className='mx-auto max-w-6xl my-12 space-y-6 px-5'>
      <h1 className='text-2xl font-bold text-center'>Dados das sessões individuais do jogo Vicuts Exergame</h1>
      <form onSubmit={handleButtonSubmit} className='w-full'>
        <div className='grid grid-cols-2 gap-2 place-content-center h-24'>
        <div className='text-center'>
          <PatientNamesDropdown
            options={patientNames}
            selectedOption={selectedPatientName}
            onOptionChange={handleSelectedPatientName}
          />
          </div>
          <div className='text-center'>
            <SessionsDropdown
              options={sessionTimestamps}
              selectedOption={selectedSession}
              onOptionChange={handleSessionSelect}
            />
          </div>
        </div>
          <div className='text-center'>
            <button type='submit'  className='bg-blue-500 text-white px-4 py-2 rounded'>Gerar gráfico</button>
          </div>
        {submitForm && < SessionChart dataArray={session} />}
        {submitForm && < PatientDataWritten session={session} selectedSessionIndex={selectedSessionIndex} />}
        
      </form>      
      <div>
        {/* <p>Valor selecionado em sessões: {selectedSession} e  seu respectivo índice: {selectedSessionIndex}</p>
        <p>Todos os pacientes disponiveis: { patientNames.join(', ') } </p>
        <p>Nome do paciente selecionado: {selectedPatientName}</p>
        <p>Lista de sessões: { sessionTimestamps.join(', ') }</p> */}
      </div>
    </div>
  )
}


