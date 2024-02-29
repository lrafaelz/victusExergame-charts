import { useNavigate } from "react-router-dom"

export const Home = () => {

  const handleIndividualSessions = () => {
    navigate('/sessoesIndividuais')
  }

  const navigate = useNavigate()
  return (
    <div className="grid grid-flow-row gap-3 place-items-center">
        <h2 className="text-xl font-bold">Selecione uma das opções abaixo</h2>
        <button onClick={handleIndividualSessions} className='bg-orangeVictus text-white px-4 py-2 rounded w-60'>Gerar gráficos a partir das sessões</button>
    </div>
  )
}
