import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DataUpload from './pages/DataUpload'
import SparkJobs from './pages/SparkJobs'
import Datasets from './pages/Datasets'
import Catalog from './pages/Catalog'
import Settings from './pages/Settings'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} />

        <main
          className={`flex-1 transition-all duration-300 ease-in-out pt-16 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          <div className="p-6 h-full overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/data/upload" element={<DataUpload />} />
              <Route path="/jobs" element={<SparkJobs />} />
              <Route path="/datasets" element={<Datasets />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
