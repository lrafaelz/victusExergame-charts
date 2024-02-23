import React from 'react'


import { Outlet } from 'react-router-dom'
import { Navbar } from './components/navbar'


export const App: React.FC = () => {
  return (
    <div>
      < Navbar />
      <div className='mx-auto max-w-6xl my-12 space-y-6 px-5'>
        <h1 className='text-3xl font-bold'>PhysioGames</h1>
        <Outlet />
      </div>
    </div>
  )
}


