import { doc, collection, getDocs, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import db from '../firebase'
import { SessionsDropdown } from '../components/sessionsDropdown'
import { PatientNamesDropdown } from '../components/patientNamesDropdown'
import { SessionChart } from '../components/sessionChart'
import { PatientDataWritten } from '../components/patientDataWritten'
import { SessionData } from '../utils/sessionData'

import { Outlet } from 'react-router-dom'
// import { HandleSelectedPatientName } from '../utils/firebasePatientsData'



// Define os tipos de dados que esperamos obter do Firestore


export const SessionsChart: React.FC = () => {
  
  const [sessions, setSessions] = useState<SessionData[]>([]) // Limpar sessions quando o usuário selecionar um novo paciente e uma nova sessão (novo gráfico)
  const [sessionTimestamps, setSessionTimestamps] = useState<string[]>([])

  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [sessionsSelected_timestamps, setSessionsSelected_timestamps] = useState<string[]>([])
  const selectedSessionIndex: number[] = []

  const [patientNames, setPatientName] = useState<string[]>([])
  const [selectedPatientName, setSelectedPatientName] = useState('')

  // Função para lidar com a mudança de opção no dropdown
  const handleSessionSelect = (selectedOption: string, selectedIndex: number, itemIndex: number) => {
    setSessions([])
    setSessionsSelected_timestamps([])
    // Lida com a seleção de sessão em cada um dos três dropdowns
    selectedSessionIndex[itemIndex] = selectedIndex
    setSelectedSessions(prevSelectedSessions => {
      const newSelectedSessions = [...prevSelectedSessions]
      newSelectedSessions[itemIndex] = selectedOption
      return newSelectedSessions
    })
    console.log('selectedSessions: ' + selectedSessions)
  }
  
  const handleSelectedPatientName = (selectedOption: string) => {
    setSelectedPatientName(selectedOption)
    setSelectedSessions([])
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
    setSessionsSelected_timestamps(selectedSessions)
    fetchSessionData()
  }

  async function getData(selectedSession: string): Promise<void> {
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
      setSessions(prevSessions => [...prevSessions, sessionData]);
    }else{
      console.log('No such document!')
    }
  }
  
  async function iterateThroughSelectedSessionsArray(selectedSessionsArray: string[]): Promise<void> {
    for (const data of selectedSessionsArray) {
      if(data)
        await getData(data);
      else
        console.log('Nenhuma sessão selecionada no index: ' + selectedSessionsArray.indexOf(data))
    }
  }

  const fetchSessionData = async () => {
    console.log('gerando grafico selected sessions', selectedSessions)
    iterateThroughSelectedSessionsArray(selectedSessions)
    .then(()=>setSelectedSessions([]))
    .catch(error => console.error(error))//Adicionar alerta
  }
  
  useEffect(() => {
    fetchPatientNames()
    if (selectedPatientName) fetchSessionNames()
  }, [selectedPatientName])

  return (
    <div> 
      <h1 className='text-2xl font-bold text-center'>Análise dos dados das sessões do jogo Vicuts Exergame</h1>
      <form onSubmit={handleButtonSubmit} className='w-full'>
        <div className='text-center'>
          <PatientNamesDropdown
            options={patientNames}
            selectedOption={selectedPatientName}
            onOptionChange={handleSelectedPatientName}
          />
          </div>
        <div className='grid grid-cols-3 gap-2 place-content-center h-24'>
            <SessionsDropdown
              options={sessionTimestamps}
              selectedOption={selectedSessions[0]}
              onOptionChange={handleSessionSelect}
              index={0}
            />
            <SessionsDropdown
              options={sessionTimestamps}
              selectedOption={selectedSessions[1]}
              onOptionChange={handleSessionSelect}
              index={1}
            />
            <SessionsDropdown
              options={sessionTimestamps}
              selectedOption={selectedSessions[2]}
              onOptionChange={handleSessionSelect}
              index={2}
            />
        </div>
          <div className='text-center'>
            <button type='submit' className='bg-orangeVictus text-white px-4 py-2 rounded'>Gerar gráfico</button>
          </div>
        {sessions.length > 0 && < SessionChart dataArray={sessions} />}
        {sessions.length > 0 && sessions.map((session, index) => (< PatientDataWritten session={session} selectedSession={ sessionsSelected_timestamps[index] } index={index} />))}
        
      </form>      
      <Outlet />
      <div>
        {/* <p>Valor selecionado em sessões: {selectedSession} e  seu respectivo índice: {selectedSessionIndex}</p>
        <p>Todos os pacientes disponiveis: { patientNames.join(', ') } </p>
        <p>Nome do paciente selecionado: {selectedPatientName}</p>
        <p>Lista de sessões: { sessionTimestamps.join(', ') }</p> */}
      </div>
    </div>
  )
}


