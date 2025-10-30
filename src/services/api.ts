/**
 * Bifrost API Service
 * Handles all API communication with the FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

// Types based on the backend Pydantic models
export interface SparkJob {
  job_id: string;
  job_name: string;
  status: 'submitted' | 'running' | 'completed' | 'failed' | 'queued';
  created_at: string;
  job_type: string;
  estimated_duration?: string;
  progress?: number;
  memory?: string;
  results?: {
    rows_processed: number;
    execution_time: string;
    output_path: string;
    metrics: {
      cpu_usage: string;
      memory_usage: string;
      data_processed: string;
    };
  };
}

export interface DeltaTableHistory {
  version: number;
  timestamp: string;
  operation: string;
  operationParameters: Record<string, unknown>;
  operationMetrics?: Record<string, unknown>;
  readVersion?: number;
  isolationLevel?: string;
}

export interface DataUpload {
  upload_id: string;
  filename: string;
  size: number;
  status: string;
  created_at: string;
}

export interface Dataset {
  name: string;
  path: string;
  size: number;
  rows?: number;
  columns?: string[];
  created_at: string;
  region: string;
}

export interface ClusterInfo {
  clusters: Array<{
    id: string;
    name: string;
    status: string;
    workers: number;
    cores: number;
    memory: string;
    region: string;
    created_at: string;
  }>;
  total_capacity: {
    cores: number;
    memory: string;
    storage: string;
  };
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    spark: string;
    minio: string;
    postgres: string;
  };
  region: string;
  compliance: string;
}

export interface DeltaTable {
  name: string;
  path: string;
  version: number;
  size_mb: number;
  num_files: number;
  rows: number | null;
  schema: Array<{
    name: string;
    type: string;
    nullable: boolean | string; // Allow both boolean and string for flexibility
  }>;
  created_at: string;
  last_modified: string;
  description: string | null;
}

export interface QueryResult {
  columns: string[];
  data: (string | number | boolean | null)[][];
  row_count: number;
  execution_time_ms: number;
  table_version: number;
}

// API Client class
class ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = 'demo-token'; // In production, get from auth context
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health and status endpoints
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health');
  }

  // Spark Jobs endpoints
  async getJobs(): Promise<SparkJob[]> {
    return this.request<SparkJob[]>('/api/jobs');
  }

  async getJob(jobId: string): Promise<SparkJob> {
    return this.request<SparkJob>(`/api/jobs/${jobId}`);
  }

  async createSparkJob(jobData: {
    job_name: string;
    sql_query?: string;
    file_path?: string;
    job_type?: string;
    european_compliance?: boolean;
  }): Promise<{ job_id: string; status: string; created_at: string; estimated_duration?: string }> {
    return this.request('/api/jobs/spark', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // Data management endpoints
  async getUploads(): Promise<DataUpload[]> {
    return this.request<DataUpload[]>('/api/data/uploads');
  }

  async uploadData(file: File): Promise<DataUpload> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/data/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getDatasets(): Promise<Dataset[]> {
    return this.request<Dataset[]>('/api/datasets');
  }

  // Cluster management
  async getClusters(): Promise<ClusterInfo> {
    return this.request<ClusterInfo>('/api/spark/clusters');
  }

  // Delta Lake Catalog endpoints
  async getDeltaTables(): Promise<DeltaTable[]> {
    return this.request<DeltaTable[]>('/api/catalog/delta-tables');
  }

  async queryDeltaTable(queryData: {
    table_path: string;
    sql_query?: string;
    limit?: number;
  }): Promise<QueryResult> {
    return this.request<QueryResult>('/api/catalog/query', {
      method: 'POST',
      body: JSON.stringify(queryData),
    });
  }

  async getDeltaTableHistory(tableName: string): Promise<DeltaTableHistory[]> {
    return this.request<DeltaTableHistory[]>(`/api/catalog/delta-tables/${tableName}/history`);
  }

  // Generic GET and POST methods for convenience
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(`/api${endpoint}`);
    return { data };
  }

  async post<T>(endpoint: string, body: Record<string, unknown>): Promise<{ data: T }> {
    const data = await this.request<T>(`/api${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { data };
  }

  // Dashboard metrics (derived from other endpoints)
  async getDashboardMetrics() {
    const [health, jobs] = await Promise.all([
      this.getHealth(),
      this.getJobs(),
      // this.getClusters(), // Not used in current implementation
    ]);

    const activeJobs = jobs.filter(job => job.status === 'running' || job.status === 'submitted');
    const completedJobs = jobs.filter(job => job.status === 'completed');
    
    // Calculate average query time from completed jobs
    const avgQueryTime = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => {
          if (job.results?.execution_time) {
            const seconds = parseFloat(job.results.execution_time.replace(' seconds', ''));
            return sum + seconds;
          }
          return sum;
        }, 0) / completedJobs.length
      : 2.1;

    // Calculate total data processed
    const totalDataProcessed = completedJobs.reduce((sum, job) => {
      if (job.results?.metrics?.data_processed) {
        const mbMatch = job.results.metrics.data_processed.match(/(\d+)MB/);
        if (mbMatch) {
          return sum + parseInt(mbMatch[1]);
        }
      }
      return sum;
    }, 0);

    return {
      dataProcessed: `${(totalDataProcessed / 1024).toFixed(1)} GB`,
      dataProcessedProgress: Math.min((totalDataProcessed / 2400), 1) * 100, // Assuming 2400MB target
      activeJobs: activeJobs.length,
      avgQueryTime: `${avgQueryTime.toFixed(1)}s`,
      gdprCompliance: 100,
      recentActivity: jobs
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(job => ({
          id: job.job_id,
          title: job.job_name,
          description: `${job.status === 'completed' ? 'Completed' : 'Processing'} ${job.job_type} job`,
          status: job.status,
          timestamp: job.created_at,
          icon: job.status === 'completed' ? '✓' : '⚡'
        })),
      services: health.services
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for easier importing
export const getHealth = () => apiClient.getHealth();
export const getJobs = () => apiClient.getJobs();
export const getJob = (jobId: string) => apiClient.getJob(jobId);
export const createSparkJob = (jobData: {
  job_name: string;
  sql_query?: string;
  file_path?: string;
  job_type?: string;
  european_compliance?: boolean;
}) => apiClient.createSparkJob(jobData);
export const getUploads = () => apiClient.getUploads();
export const uploadData = (file: File) => apiClient.uploadData(file);
export const getDatasets = () => apiClient.getDatasets();
export const getClusters = () => apiClient.getClusters();
export const getDashboardMetrics = () => apiClient.getDashboardMetrics();
export const getDeltaTables = () => apiClient.getDeltaTables();
export const queryDeltaTable = (queryData: {
  table_path: string;
  sql_query?: string;
  limit?: number;
}) => apiClient.queryDeltaTable(queryData);
export const getDeltaTableHistory = (tableName: string) => apiClient.getDeltaTableHistory(tableName);

// Export the client for custom requests
export const api = apiClient;