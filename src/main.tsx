import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { Home } from './routes/home'
import { SingleSessionChart } from './routes/sessionsChart'
import { NotFound } from './routes/notFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: < Home />
      },
      {
        path: '/sessoesIndividuais',
        element: < SingleSessionChart />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
