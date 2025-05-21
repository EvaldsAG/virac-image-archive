// import { useState } from 'react'
import { RecentIMG } from "./functions/recentimg.tsx";
// import { MiniGallery } from "./functions/mini-gallery.tsx";
import MiniGallery from "./functions/mini-gallery.tsx";
import './App.css'


function App() {


  return (
    <>
      <div className="logoCollection">
        <a href="https://racobeu.wordpress.com" target="_blank">
          <img src="https://lirp.cdn-website.com/f6b5d556/dms3rep/multi/opt/LOGO-1920w.jpeg" className="logo" alt="RACOBEU logo" />
        </a>
        <a href="https://www.virac.eu" target="_blank">
          <img src="https://irp-cdn.multiscreensite.com/0502f3c5/dms3rep/multi/virac_logo_white_circle_moon.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://erasmus-plus.ec.europa.eu" target="_blank">
          <img src="https://lirp.cdn-website.com/f6b5d556/dms3rep/multi/opt/Lidzfinanse_Erasmus_progr_logo-1920w.png" className="logo" alt="Erasmus logo" />
        </a>
      </div>
      <div className="title">

        <h1>VIRAC<br />Solar Image Archive</h1>

      </div>
      <div className="spacer"></div>
      <RecentIMG />

      <div className="spacer"></div>
      <MiniGallery />



    </>
  )
}

export default App
