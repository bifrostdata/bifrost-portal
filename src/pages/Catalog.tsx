import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface DeltaTable {
  name: string;
  path: string;
  version: number;
  size_mb: number;
  num_files: number;
  rows: number | null;
  schema: Array<{
    name: string;
    type: string;
    nullable: boolean | string; // Allow both boolean and string
  }>;
  created_at: string;
  last_modified: string;
  description: string | null;
}

interface QueryResult {
  columns: string[];
  data: (string | number | boolean | null)[][];
  row_count: number;
  execution_time_ms: number;
  table_version: number;
}

interface DeltaTableHistory {
  version: number;
  timestamp: string;
  operation: string;
  operationParameters: Record<string, unknown>;
  operationMetrics?: Record<string, unknown>;
  readVersion?: number;
  isolationLevel?: string;
}

interface TableHistoryResponse {
  current_version: number;
  history: DeltaTableHistory[];
}

const Catalog: React.FC = () => {
  const [tables, setTables] = useState<DeltaTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<DeltaTable | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'history'>('preview');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [customQueryResult, setCustomQueryResult] = useState<QueryResult | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [customQueryLoading, setCustomQueryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [tableHistory, setTableHistory] = useState<TableHistoryResponse | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/catalog/delta-tables');
      setTables(response.data as DeltaTable[]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to load Delta tables: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTable = async (table: DeltaTable) => {
    try {
      setQueryLoading(true);
      setSelectedTable(table);
      setActiveTab('preview');
      setShowPreviewModal(true);
      
      const response = await api.post('/catalog/query', {
        table_path: table.path,
        limit: 20
      });
      
      setQueryResult(response.data as QueryResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to preview table: ' + errorMessage);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!selectedTable || !customQuery.trim()) return;
    
    try {
      setCustomQueryLoading(true);
      setQueryError(null);
      setCustomQueryResult(null);
      
      const response = await api.post('/catalog/query', {
        table_path: selectedTable.path,
        sql_query: customQuery,
        limit: 100
      });
      
      setCustomQueryResult(response.data as QueryResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setQueryError('Query failed: ' + errorMessage);
    } finally {
      setCustomQueryLoading(false);
    }
  };

  const handleShowHistory = async (table: DeltaTable) => {
    try {
      setSelectedTable(table);
      setActiveTab('history');
      setShowPreviewModal(true);
      
      const response = await api.get(`/catalog/delta-tables/${table.name}/history`);
      setTableHistory(response.data as TableHistoryResponse);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to load table history: ' + errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const formatBytes = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-euro-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3 text-3xl">🗂️</span>
            Delta Lake Catalog
          </h1>
          <p className="text-gray-600 mt-2">
            Browse and query Delta Lake tables in your Bifrost data warehouse. 
            All tables support ACID transactions, time travel, and schema evolution.
          </p>
        </div>
        <button
          onClick={loadTables}
          disabled={loading}
          className="px-4 py-2 bg-euro-blue-600 text-white rounded-lg hover:bg-euro-blue-700 disabled:opacity-50 flex items-center"
        >
          <span className="mr-2">🔄</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <span className="text-red-500 mr-2">⚠️</span>
            <div className="text-red-700">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.name} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">📊</span>
              <h3 className="text-lg font-semibold text-gray-900">{table.name}</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              {table.description || 'Delta Lake table'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-euro-blue-100 text-euro-blue-800 text-xs rounded border border-euro-blue-200">
                v{table.version}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                {formatBytes(table.size_mb)}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                {table.rows?.toLocaleString() || 'Unknown'} rows
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                {table.num_files} files
              </span>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              <div>Created: {formatDate(table.created_at)}</div>
              <div>Modified: {formatDate(table.last_modified)}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePreviewTable(table)}
                className="flex-1 px-3 py-2 bg-euro-blue-600 text-white text-sm rounded hover:bg-euro-blue-700 flex items-center justify-center"
              >
                <span className="mr-1">👁️</span>
                Preview
              </button>
              <button
                onClick={() => {
                  setSelectedTable(table);
                  setCustomQuery(`SELECT * FROM delta.\`${table.path}\` LIMIT 10`);
                  setCustomQueryResult(null);
                  setQueryError(null);
                  setShowQueryModal(true);
                }}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center"
              >
                <span className="mr-1">⚡</span>
                Query
              </button>
              <button
                onClick={() => handleShowHistory(table)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                📜
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">📊</span>
                {selectedTable.name}
              </h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'preview'
                      ? 'border-b-2 border-euro-blue-600 text-euro-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Data Preview
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'schema'
                      ? 'border-b-2 border-euro-blue-600 text-euro-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Schema
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'history'
                      ? 'border-b-2 border-euro-blue-600 text-euro-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  History
                </button>
              </nav>
            </div>

            <div className="p-6 overflow-auto max-h-[60vh]">
              {activeTab === 'preview' && (
                <div>
                  {queryLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-euro-blue-600"></div>
                    </div>
                  ) : queryResult ? (
                    <div>
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-blue-700">
                          Showing {queryResult.data.length} of {queryResult.row_count} rows 
                          (v{queryResult.table_version}, {queryResult.execution_time_ms}ms)
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {queryResult.columns.map((column) => (
                                <th key={column} className="px-4 py-2 text-left font-medium text-gray-900 border-b border-gray-200">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.data.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="px-4 py-2 border-b border-gray-200">
                                    {cell === null ? <em className="text-gray-400">null</em> : String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">No data to display</div>
                  )}
                </div>
              )}

              {activeTab === 'schema' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-900 border-b border-gray-200">Column Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900 border-b border-gray-200">Data Type</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-900 border-b border-gray-200">Nullable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.schema.map((column) => (
                        <tr key={column.name} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b border-gray-200 flex items-center">
                            <span className="mr-2">🔗</span>
                            {column.name}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                              {column.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            <span className={`px-2 py-1 text-xs rounded border ${
                              (column.nullable === true || column.nullable === "true")
                                ? 'bg-gray-100 text-gray-700 border-gray-200' 
                                : 'bg-euro-blue-100 text-euro-blue-800 border-euro-blue-200'
                            }`}>
                              {(column.nullable === true || column.nullable === "true") ? "Yes" : "No"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'history' && tableHistory && (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-blue-700">
                      Current version: {tableHistory.current_version}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {tableHistory.history.map((entry: DeltaTableHistory) => (
                      <div key={entry.version} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium mr-4">Version {entry.version}</h4>
                              <span className="px-2 py-1 bg-euro-blue-100 text-euro-blue-800 text-xs rounded border border-euro-blue-200">
                                {entry.operation}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Operation Parameters:</h5>
                            <div className="bg-gray-100 p-3 rounded text-sm">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(entry.operationParameters, null, 2)}
                              </pre>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Metrics:</h5>
                            <div className="bg-gray-100 p-3 rounded text-sm">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(entry.operationMetrics, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {showQueryModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                Query Table: {selectedTable.name}
              </h2>
              <button
                onClick={() => {
                  setShowQueryModal(false);
                  setCustomQueryResult(null);
                  setQueryError(null);
                  setCustomQuery('');
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {queryError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <div className="text-red-700">
                      {queryError}
                      <button 
                        onClick={() => setQueryError(null)}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                  SQL Query
                </label>
                <textarea
                  id="query"
                  rows={6}
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-euro-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your SQL query to execute against this Delta table"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter your SQL query to execute against this Delta table
                </p>
              </div>
              
              <button
                onClick={handleCustomQuery}
                disabled={customQueryLoading || !customQuery.trim()}
                className="mb-4 px-4 py-2 bg-euro-blue-600 text-white rounded-lg hover:bg-euro-blue-700 disabled:opacity-50 flex items-center"
              >
                <span className="mr-2">⚡</span>
                {customQueryLoading ? 'Executing...' : 'Execute Query'}
              </button>

              {customQueryResult && (
                <div className="max-h-96 overflow-auto">
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <span className="text-green-700">
                      Query completed: {customQueryResult.data.length} rows returned in {customQueryResult.execution_time_ms}ms
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {customQueryResult.columns.map((column) => (
                            <th key={column} className="px-4 py-2 text-left font-medium text-gray-900 border-b border-gray-200">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {customQueryResult.data.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-2 border-b border-gray-200">
                                {cell === null ? <em className="text-gray-400">null</em> : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;