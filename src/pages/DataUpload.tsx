import React from 'react'

const DataUpload: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="text-3xl">📤</div>
        <h1 className="text-3xl font-bold text-euro-blue-900">Data Upload</h1>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-6xl text-euro-blue-600 mb-4">☁️</div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Upload Your Data
          </h2>
          
          <p className="text-gray-600 mb-6">
            Drop your CSV, JSON, or Parquet files here to get started with Bifrost processing.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 hover:border-euro-blue-400 transition-colors duration-200">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-500 mb-2">Drag & drop files here</p>
            <p className="text-sm text-gray-400">CSV, JSON, Parquet supported</p>
          </div>
          
          <button className="btn-euro-gradient text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 mx-auto hover:shadow-lg transition-all duration-200">
            <span className="text-xl">📤</span>
            <span>Select Files</span>
          </button>
        </div>
        
        {/* Upload Progress */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Recent Uploads</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                <div>
                  <p className="font-medium text-gray-900">european_sales_q4.csv</p>
                  <p className="text-sm text-gray-600">2.4 MB • Completed</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">2 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">📊</div>
                <div>
                  <p className="font-medium text-gray-900">customer_data.json</p>
                  <p className="text-sm text-gray-600">856 KB • Processing</p>
                </div>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default DataUpload;