import React, { useState, useEffect } from 'react'
import { 
  ChevronDownIcon, 
  PlayIcon, 
  ClockIcon, 
  CircleStackIcon, 
  CpuChipIcon, 
  CloudArrowDownIcon, 
  EyeIcon,
  ChevronRightIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { getJobs, getJob, SparkJob } from '../services/api'

const SparkJobs: React.FC = () => {
  const [jobs, setJobs] = useState<SparkJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())
  const [jobDetails, setJobDetails] = useState<Map<string, SparkJob>>(new Map())

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const fetchedJobs = await getJobs()
        setJobs(fetchedJobs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
    
    // Refresh jobs every 5 seconds for real-time updates
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobDetails = async (jobId: string) => {
    try {
      const jobDetailData = await getJob(jobId)
      setJobDetails(prev => new Map(prev).set(jobId, jobDetailData))
    } catch (err) {
      console.error('Failed to fetch job details:', err)
    }
  }

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
      // Fetch detailed job info when expanding
      fetchJobDetails(jobId)
    }
    setExpandedJobs(newExpanded)
  }

  const getJobWithDetails = (job: SparkJob): SparkJob => {
    const details = jobDetails.get(job.job_id)
    return details || job
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'queued': 
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🏃'
      case 'completed': return '✅'
      case 'queued': case 'submitted': return '⏳'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const formatDuration = (seconds: string | number) => {
    const num = typeof seconds === 'string' ? parseFloat(seconds.replace(' seconds', '')) : seconds
    if (num < 60) return `${num.toFixed(1)}s`
    if (num < 3600) return `${(num / 60).toFixed(1)}m`
    return `${(num / 3600).toFixed(1)}h`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-euro-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Jobs</h3>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">Make sure the FastAPI backend is running on http://localhost:8000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">⚡</div>
          <div>
            <h1 className="text-3xl font-bold text-euro-blue-900">Spark Jobs</h1>
            <p className="text-gray-600">Monitor and manage your data processing jobs</p>
          </div>
        </div>
        
        {/* Job Actions Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="btn-euro-gradient text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-200">
            <PlayIcon className="h-5 w-5" />
            <span>New Job</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Menu.Button>
          
          <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  className={`${
                    active ? 'bg-euro-blue-50 text-euro-blue-600' : 'text-gray-900'
                  } group flex w-full items-center px-4 py-3 text-sm font-medium transition-colors duration-200`}
                >
                  <span className="mr-3 text-lg">📊</span>
                  Data Analysis Job
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  className={`${
                    active ? 'bg-euro-blue-50 text-euro-blue-600' : 'text-gray-900'
                  } group flex w-full items-center px-4 py-3 text-sm font-medium transition-colors duration-200`}
                >
                  <span className="mr-3 text-lg">🔄</span>
                  ETL Pipeline Job
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">
                {jobs.filter(job => job.status === 'running').length}
              </p>
            </div>
            <div className="text-2xl">🏃</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter(job => job.status === 'completed').length}
              </p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {jobs.filter(job => job.status === 'failed').length}
              </p>
            </div>
            <div className="text-2xl">❌</div>
          </div>
        </div>
      </div>
      
      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">🔄 Job History</h2>
          <p className="text-sm text-gray-600">Click on any job to view detailed execution information</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {jobs.length > 0 ? jobs.map((job) => {
            const jobWithDetails = getJobWithDetails(job)
            return (
            <div key={job.job_id} className="hover:bg-gray-50 transition-colors duration-200">
              {/* Main Job Row */}
              <div 
                className="px-6 py-4 cursor-pointer"
                onClick={() => toggleJobExpansion(job.job_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {expandedJobs.has(job.job_id) ? (
                        <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-lg">{getStatusIcon(job.status)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{job.job_name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{new Date(job.created_at).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CircleStackIcon className="h-4 w-4" />
                          <span>{job.job_type}</span>
                        </span>
                        <span>ID: {job.job_id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center space-x-6 text-sm">
                    {jobWithDetails.results && (
                      <>
                        <div className="text-center">
                          <p className="font-medium text-gray-900">{jobWithDetails.results.rows_processed.toLocaleString()}</p>
                          <p className="text-gray-500">rows</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900">{formatDuration(jobWithDetails.results.execution_time)}</p>
                          <p className="text-gray-500">duration</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900">{jobWithDetails.results.metrics.data_processed}</p>
                          <p className="text-gray-500">processed</p>
                        </div>
                      </>
                    )}
                    {job.status === 'running' && (
                      <div className="text-center">
                        <div className="animate-pulse bg-blue-500 h-2 w-16 rounded"></div>
                        <p className="text-gray-500 mt-1">processing...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedJobs.has(job.job_id) && (
                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Execution Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <CpuChipIcon className="h-5 w-5" />
                        <span>Execution Details</span>
                      </h4>
                      
                      <div className="bg-white rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Job ID:</span>
                          <span className="font-mono text-sm">{job.job_id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Job Type:</span>
                          <span className="capitalize">{job.job_type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Started:</span>
                          <span>{new Date(job.created_at).toLocaleString()}</span>
                        </div>
                        {job.estimated_duration && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Estimated Duration:</span>
                            <span>{job.estimated_duration}</span>
                          </div>
                        )}
                        {jobWithDetails.results && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Actual Duration:</span>
                              <span className="font-medium text-green-600">{jobWithDetails.results.execution_time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Rows Processed:</span>
                              <span className="font-medium">{jobWithDetails.results.rows_processed.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Resource Usage & Output */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <CloudArrowDownIcon className="h-5 w-5" />
                        <span>Resources & Output</span>
                      </h4>
                      
                      {jobWithDetails.results ? (
                        <div className="bg-white rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">CPU Usage:</span>
                            <span className="font-medium">{jobWithDetails.results.metrics.cpu_usage}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Memory Usage:</span>
                            <span className="font-medium">{jobWithDetails.results.metrics.memory_usage}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Data Processed:</span>
                            <span className="font-medium">{jobWithDetails.results.metrics.data_processed}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Output Location:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-blue-600">{jobWithDetails.results.output_path}</span>
                              <button 
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="View output"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Performance Metrics Visualization */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Resource Utilization</p>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>CPU</span>
                                  <span>{jobWithDetails.results.metrics.cpu_usage}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: jobWithDetails.results.metrics.cpu_usage }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Memory</span>
                                  <span>{jobWithDetails.results.metrics.memory_usage}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: '65%' }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : job.status === 'running' ? (
                        <div className="bg-white rounded-lg p-4">
                          <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <p className="text-center text-gray-500 mt-4">Job is running... Metrics will appear when completed.</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-center text-gray-500">No execution data available yet</p>
                          <p className="text-center text-gray-400 text-sm mt-1">
                            {job.status === 'submitted' ? 'Job is queued for execution' : 'Click to refresh job details'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            )
          }) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">No jobs found</p>
              <p className="text-sm text-gray-400">Create a new Spark job to get started with data processing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SparkJobs