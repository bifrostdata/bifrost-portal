import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface SidebarProps {
  open: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { text: 'Dashboard', icon: '📊', path: '/dashboard' },
    { text: 'Data Upload', icon: '📤', path: '/data/upload' },
    { text: 'Spark Jobs', icon: '⚡', path: '/jobs' },
    { text: 'Datasets', icon: '💾', path: '/datasets' },
    { text: 'Data Catalog', icon: '🗂️', path: '/catalog' },
  ]

  const bottomItems = [
    { text: 'Settings', icon: '⚙️', path: '/settings' },
  ]

  if (!open) return null

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-gray-50 border-r border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          Data Platform
        </h3>
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-euro-blue-100 text-euro-blue-800 border border-euro-blue-200">
          🇪🇺 GDPR Compliant
        </div>
      </div>
      
      <div className="border-t border-gray-200" />
      
      {/* Main Menu */}
      <div className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.text}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-euro-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-euro-blue-50 hover:text-euro-blue-600'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.text}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Status Section */}
      <div className="px-4 py-3 bg-gray-100">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center">
            <span className="mr-2">🚀</span>
            <span>Status: Operational</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">⚡</span>
            <span>Cluster: 2 workers</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">💾</span>
            <span>Storage: 850GB free</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />
      
      {/* Bottom Menu */}
      <div className="px-3 py-2">
        <nav className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.text}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-euro-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-euro-blue-50 hover:text-euro-blue-600'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.text}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar