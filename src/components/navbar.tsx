import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav className='flex space-x-4'>
        <Link to='/'>Home</Link>
        <Link to='/sessoesIndividuais'>Sessões Individuais</Link>
        <Link to='/compararSessoes'>Comparar Sessões</Link>
    </nav>
  )
}
