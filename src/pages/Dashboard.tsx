import React, { useState, useEffect } from 'react'
import { getDashboardMetrics } from '../services/api'

interface DashboardMetrics {
  dataProcessed: string;
  dataProcessedProgress: number;
  activeJobs: number;
  avgQueryTime: string;
  gdprCompliance: number;
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    timestamp: string;
    icon: string;
  }>;
  services: {
    spark: string;
    minio: string;
    postgres: string;
  };
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-euro-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">Make sure the FastAPI backend is running on http://localhost:8000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="text-3xl nordic-bridge">�</div>
          <div>
            <h1 className="text-3xl font-bold text-euro-blue-900">
              Welcome to Bifrost
            </h1>
            <p className="text-gray-600 mt-1">
              Nordic Data Platform - Bridge your data across all realms
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Processed</p>
              <p className="text-2xl font-bold text-euro-blue-900">{metrics?.dataProcessed || '0 GB'}</p>
            </div>
            <div className="h-12 w-12 bg-euro-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-2xl">💾</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-euro-blue-600 h-2 rounded-full" style={{ width: `${metrics?.dataProcessedProgress || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-euro-blue-900">{metrics?.activeJobs || 0}</p>
            </div>
            <div className="h-12 w-12 bg-euro-gold-100 rounded-lg flex items-center justify-center">
              <div className="text-2xl">⚡</div>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {metrics?.services.spark === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Query Time</p>
              <p className="text-2xl font-bold text-euro-blue-900">{metrics?.avgQueryTime || '0s'}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="text-2xl">🚀</div>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Optimized
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GDPR Compliant</p>
              <p className="text-2xl font-bold text-euro-blue-900">{metrics?.gdprCompliance || 100}%</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-2xl">🔒</div>
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-euro-blue-100 text-euro-blue-800">
              🇪🇺 European
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="btn-euro-gradient text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200">
            <span>📤</span>
            <span>Upload Data</span>
          </button>
          <button className="border-2 border-euro-blue-600 text-euro-blue-600 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-euro-blue-50 transition-all duration-200">
            <span>⚡</span>
            <span>New Spark Job</span>
          </button>
          <button className="border-2 border-euro-blue-600 text-euro-blue-600 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-euro-blue-50 transition-all duration-200">
            <span>📊</span>
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">� Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white">
              ✓
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">European Sales Analysis Complete</p>
              <p className="text-sm text-gray-600">Processed 1.2M records in 4.3 seconds</p>
            </div>
            <span className="text-xs text-green-600 font-medium">2 min ago</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              📤
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">GDPR Compliance Report Uploaded</p>
              <p className="text-sm text-gray-600">New dataset: customer_consent_2025.csv</p>
            </div>
            <span className="text-xs text-blue-600 font-medium">15 min ago</span>
          </div>
        </div>
      </div>

      {/* European Advantages */}
      <div className="bg-gradient-to-r from-euro-blue-900 to-euro-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">🌍 European Advantage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-medium">Performance</h3>
            <p className="text-sm text-euro-blue-200">3x faster than US alternatives</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-medium">Cost Effective</h3>
            <p className="text-sm text-euro-blue-200">60% lower than Databricks</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard