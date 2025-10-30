import React from 'react'
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-euro-blue-900 via-euro-blue-800 to-euro-blue-700 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-4">
              <div className="nordic-bridge text-2xl mr-3">�</div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-euro-gold-300 bg-clip-text text-transparent">
                Bifrost
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-euro-gold-500/20 text-euro-gold-300 rounded-full border border-euro-gold-500/30">
                Nordic Data Platform
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-euro-gold-300 font-medium">🌍 EU-Central-1</span>
            </div>
            
            <button className="relative text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-euro-gold-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                3
              </span>
            </button>
            
            <button className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200">
              <UserCircleIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar