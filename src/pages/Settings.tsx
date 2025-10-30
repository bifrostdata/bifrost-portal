import React from 'react'

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="text-3xl">⚙️</div>
        <h1 className="text-3xl font-bold text-euro-blue-900">Settings</h1>
      </div>
      
      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              value="johann.svenlert" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value="johan@bifrost.no" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
      
      {/* European Advantage */}
      <div className="bg-gradient-to-r from-euro-blue-900 to-euro-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">🌍 European Advantage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-medium">Data Sovereignty</h3>
            <p className="text-sm text-euro-blue-200">Your data stays in Europe</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <h3 className="font-medium">GDPR Native</h3>
            <p className="text-sm text-euro-blue-200">Built-in compliance tools</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">�</div>
            <h3 className="font-medium">Cost Effective</h3>
            <p className="text-sm text-euro-blue-200">60% lower than Databricks</p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex space-x-4">
        <button className="btn-euro-gradient text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200">
          Save Changes
        </button>
        <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200">
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

export default Settings