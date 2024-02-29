import React from 'react'


import { Outlet } from 'react-router-dom'
import { NavbarVicuts } from './components/navbarVictus'


export const App: React.FC = () => {
  return (
    <div>
      < NavbarVicuts />
      <div className='mx-auto max-w-6xl my-12 space-y-6 px-5'>
        <Outlet />
      </div>
    </div>
  )
}


