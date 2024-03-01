import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { createHashRouter, RouterProvider } from 'react-router-dom'

import { Home } from './routes/home'
import { App } from './app'
import { SessionsChart } from './routes/sessionsChart'
import { NotFound } from './routes/notFound'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/graficos',
        element: <SessionsChart />,
      },
    ]
  }  
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
