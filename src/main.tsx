import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { RecentImageProvider } from "./functions/RecentImageContext.tsx";
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RecentImageProvider>
        <App />
      </RecentImageProvider>
    </BrowserRouter>
  </StrictMode>
)
