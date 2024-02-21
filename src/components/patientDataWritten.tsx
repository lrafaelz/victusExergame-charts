import { SessionData } from '../app'


interface PatientDataWrittenProps {
    session: SessionData
    selectedSessionIndex: number
}

export const PatientDataWritten: React.FC<PatientDataWrittenProps> = ({ session, selectedSessionIndex }) => {
    return (
        <div>      
          <div className='border border-gray-200 rounded-md p-4 my-4'>
            <h2 className='text-lg font-bold'>Informações por escrito da sessão { selectedSessionIndex }</h2>
            <p >Distância: { session.distancia }</p>
            <p className='bg-gray-200'>Pontuação: { session.pontuacao }</p>
            <p>Tempo de sessão: { session.tempoDeSessao }</p>
            <p className='bg-gray-200'>EMG: { session.EMG?.join(', ') }</p>
            <p >BPM: { session.BPM?.join(', ') }</p>
            <p className='bg-gray-200'>Velocidade: { session.velocidade?.join(', ') }</p>
          </div>      
        </div>
    )
}