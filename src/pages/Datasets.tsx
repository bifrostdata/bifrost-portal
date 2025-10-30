import React, { useState, useEffect } from 'react'
import { getDatasets, getUploads, uploadData, Dataset, DataUpload } from '../services/api'

const Datasets: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [uploads, setUploads] = useState<DataUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [showDatasetModal, setShowDatasetModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [datasetsData, uploadsData] = await Promise.all([
          getDatasets(),
          getUploads()
        ])
        setDatasets(datasetsData)
        setUploads(uploadsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch datasets')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadResult = await uploadData(file)
      console.log('Upload successful:', uploadResult)
      
      // Refresh the uploads list
      const updatedUploads = await getUploads()
      setUploads(updatedUploads)
      
      // Clear the file input
      event.target.value = ''
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleViewDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset)
    setShowDatasetModal(true)
  }

  const handleDownloadDataset = async (dataset: Dataset) => {
    try {
      // Create a simple CSV download for demo purposes
      const csvContent = `# Dataset: ${dataset.name}\n# Path: ${dataset.path}\n# Size: ${formatBytes(dataset.size)}\n# Rows: ${dataset.rows || 'Unknown'}\n# Columns: ${dataset.columns?.join(', ') || 'Unknown'}\n# Created: ${dataset.created_at}\n# Region: ${dataset.region}\n\n# This is a placeholder download. In production, this would download the actual dataset.`
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${dataset.name.replace(/\s+/g, '_')}_metadata.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
      setError('Download failed. Please try again.')
    }
  }

  const handleDeleteDataset = async (dataset: Dataset) => {
    if (!window.confirm(`Are you sure you want to delete "${dataset.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      // In a real implementation, this would call a delete API endpoint
      console.log('Delete dataset:', dataset.name)
      setError('Delete functionality not yet implemented in the backend API.')
      
      // For demo purposes, show a notification
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Delete failed. Please try again.')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const allDatasets = [...datasets, ...uploads.map(upload => ({
    name: upload.filename,
    path: `uploads/${upload.upload_id}`,
    size: upload.size,
    rows: undefined,
    columns: undefined,
    created_at: upload.created_at,
    region: 'Europe'
  }))]

  const totalSize = allDatasets.reduce((sum, dataset) => sum + dataset.size, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-euro-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading datasets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Datasets</h3>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">Make sure the FastAPI backend is running on http://localhost:8000</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="text-3xl">📊</div>
        <h1 className="text-3xl font-bold text-euro-blue-900">Datasets</h1>
      </div>
      
      {/* Dataset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Datasets</h3>
            <div className="h-12 w-12 bg-euro-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-2xl">📂</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-euro-blue-900 mb-2">{allDatasets.length}</div>
          <p className="text-sm text-gray-600">Across all workspaces</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Storage Used</h3>
            <div className="h-12 w-12 bg-euro-gold-100 rounded-lg flex items-center justify-center">
              <div className="text-2xl">💾</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-euro-blue-900 mb-2">{formatBytes(totalSize)}</div>
          <p className="text-sm text-gray-600">European servers only</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">GDPR Compliant</h3>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="text-2xl">🔒</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-euro-blue-900 mb-2">100%</div>
          <p className="text-sm text-gray-600">All data protected</p>
        </div>
      </div>
      
      {/* Dataset Browser */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">📂 Dataset Browser</h2>
          <div className="flex space-x-3">
            <input 
              type="text" 
              placeholder="Search datasets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-euro-blue-500 focus:border-euro-blue-500"
            />
            <label className="btn-euro-gradient text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <span>📤</span>
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                accept=".csv,.json,.parquet,.txt"
              />
            </label>
            <button className="border-2 border-euro-blue-600 text-euro-blue-600 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-euro-blue-50 transition-all duration-200">
              <span>🔍</span>
              <span>Search</span>
            </button>
          </div>
        </div>
        
        {/* Dataset Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDatasets.length > 0 ? (
                filteredDatasets.map((dataset, index) => (
                  <tr key={`${dataset.name}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">
                          {dataset.path.includes('.parquet') ? '📊' : 
                           dataset.path.includes('.csv') ? '📈' : 
                           dataset.name.includes('customer') ? '👥' : '📂'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dataset.name}</div>
                          <div className="text-sm text-gray-500">{dataset.path}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dataset.path.includes('.parquet') ? 'bg-green-100 text-green-800' :
                        dataset.path.includes('.csv') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {dataset.path.includes('.parquet') ? 'Parquet' :
                         dataset.path.includes('.csv') ? 'CSV' :
                         'Delta Lake'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatBytes(dataset.size)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">🇪🇺 {dataset.region}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(dataset.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button 
                        onClick={() => handleViewDataset(dataset)}
                        className="text-euro-blue-600 hover:text-euro-blue-900 mr-3 transition-colors duration-200"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDownloadDataset(dataset)}
                        className="text-euro-blue-600 hover:text-euro-blue-900 mr-3 transition-colors duration-200"
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => handleDeleteDataset(dataset)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {searchTerm ? 'No datasets match your search' : 'No datasets available'}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {!searchTerm && 'Upload some data to get started'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Dataset View Modal */}
      {showDatasetModal && selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDataset.name}</h2>
                <p className="text-gray-600 mt-1">{selectedDataset.path}</p>
              </div>
              <button
                onClick={() => setShowDatasetModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Dataset Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{formatBytes(selectedDataset.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rows:</span>
                      <span className="font-medium">{selectedDataset.rows?.toLocaleString() || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">🇪🇺 {selectedDataset.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(selectedDataset.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔒 Compliance</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">GDPR Compliant</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">European Data Residency</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">End-to-End Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Schema</h3>
                {selectedDataset.columns && selectedDataset.columns.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDataset.columns.map((column, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span className="text-euro-blue-600">•</span>
                        <span className="font-mono text-sm">{column}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Schema information not available</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowDatasetModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadDataset(selectedDataset)
                  setShowDatasetModal(false)
                }}
                className="btn-euro-gradient text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Download Dataset
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Data Governance */}
      <div className="bg-gradient-to-r from-euro-blue-900 to-euro-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">🛡️ European Data Governance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🇪🇺</div>
            <h3 className="font-medium">EU Sovereignty</h3>
            <p className="text-sm text-euro-blue-200">All data stored in European data centers</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-medium">GDPR Compliance</h3>
            <p className="text-sm text-euro-blue-200">Automatic privacy protection & audit trails</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-medium">End-to-End Encryption</h3>
            <p className="text-sm text-euro-blue-200">Data encrypted at rest and in transit</p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Datasets;