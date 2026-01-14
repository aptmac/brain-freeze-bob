import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Calculator from './components/Calculator'
import Sandbox from './components/Sandbox'
import './App.css'

function App() {
  const location = useLocation()
  const activeTab = location.pathname.includes('/sandbox') ? 'sandbox' : 'calculator'

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">❄️ Brain Freeze</h1>
        <p className="app-subtitle">
          MTG Combo Calculator by <a href="https://www.ibm.com/products/bob" target="_blank" rel="noopener noreferrer" className="bob-link"><img src={`${import.meta.env.BASE_URL}bob-logo.png`} alt="Bob" className="bob-logo" /> Bob</a>
        </p>
        
        <div className="tab-navigation">
          <Link
            to="/"
            className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
          >
            🧮 Calculator
          </Link>
          <Link
            to="/sandbox"
            className={`tab-button ${activeTab === 'sandbox' ? 'active' : ''}`}
          >
            🎮 Sandbox
          </Link>
        </div>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/sandbox" element={<Sandbox />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

// Made with Bob
