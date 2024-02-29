import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app'
import './index.css'

import { createHashRouter, HashRouter, RouterProvider } from 'react-router-dom'

import { Home } from './routes/home'
import { SessionsChart } from './routes/sessionsChart'
import { NotFound } from './routes/notFound'

const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <NotFound />,
  },
  { 
    path: '/graficos',
    element: <SessionsChart />,
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
