import React, { useState, useEffect, useCallback } from 'react';
import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import { BlockchainStatus } from "./BlockchainStatus";
import blockchainService from '../services/blockchainService';

import { 
  Shield,  
  Eye, 
  X,
  CheckCircle,
  AlertCircle,
  Activity,
  Clock,
  Hash,
  Link,
  Zap,
  RefreshCw,
  Database,
  Lock,
  ExternalLink,
  Copy,
  Search
} from 'lucide-react';

export const Blockchain = () => {
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch blockchain data with proper error handling
  const fetchBlockchainData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if blockchain service is connected
      const connected = blockchainService.isConnected();
      setIsConnected(connected);
      
      // Fetch blockchain stats from backend
      const response = await api.get('/blockchain/stats');
      console.log('Blockchain stats response:', response);
      
      if (response.success) {
        setBlockchainStats(response.stats);
        setVerification({ 
          isValid: true, 
          blockCount: response.stats.totalRecords,
          message: 'Blockchain connected successfully'
        });
      } else {
        // Handle case where blockchain is not available
        setBlockchainStats({
          totalRecords: 0,
          totalPatients: 0,
          contractAddress: null,
          network: null
        });
        setVerification({ 
          isValid: false, 
          error: response.error || 'Blockchain not available',
          message: response.error || 'Contract not deployed or network issues'
        });
      }
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      setError('Failed to load blockchain data: ' + error.message);
      
      // Set default values when blockchain is not available
      setBlockchainStats({
        totalRecords: 0,
        totalPatients: 0,
        contractAddress: null,
        network: null
      });
      setVerification({ 
        isValid: false, 
        error: 'Connection failed',
        message: 'Unable to connect to blockchain service'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh blockchain data every 30 seconds
  useEffect(() => {
    fetchBlockchainData();
    
    const interval = setInterval(() => {
      fetchBlockchainData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchBlockchainData]);

  // Listen for blockchain events
  useEffect(() => {
    const handleBlockchainUpdate = () => {
      console.log('Blockchain update detected, refreshing data...');
      fetchBlockchainData();
    };

    // Listen for custom events that might be fired when records are created
    window.addEventListener('blockchain-update', handleBlockchainUpdate);
    window.addEventListener('record-created', handleBlockchainUpdate);

    return () => {
      window.removeEventListener('blockchain-update', handleBlockchainUpdate);
      window.removeEventListener('record-created', handleBlockchainUpdate);
    };
  }, [fetchBlockchainData]);

  const handleVerifyRecord = async () => {
    if (!verifyHash.trim()) {
      setError('Please enter a record hash to verify');
      return;
    }

    setVerifyLoading(true);
    setVerifyResult(null);
    setError(null);

    try {
      // Try frontend verification first if connected
      if (blockchainService.isConnected()) {
        const result = await blockchainService.verifyRecord(verifyHash);
        setVerifyResult(result);
      } else {
        // Fallback to backend verification
        const result = await api.post('/blockchain/verify-record', { recordHash: verifyHash });
        setVerifyResult(result);
      }
    } catch (error) {
      console.error('Error verifying record:', error);
      setError('Failed to verify record: ' + error.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleGetRecordDetails = async (recordHash) => {
    try {
      setError(null);
      let result;
      
      if (blockchainService.isConnected()) {
        result = await blockchainService.getRecordDetails(recordHash);
      } else {
        const response = await api.get(`/blockchain/record/${recordHash}`);
        result = response;
      }

      if (result.success) {
        setSelectedRecord(result.record);
      } else {
        setError(result.error || 'Failed to get record details');
      }
    } catch (error) {
      console.error('Error getting record details:', error);
      setError('Failed to get record details: ' + error.message);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) return <LoadingSpinner message="Loading blockchain data..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-3xl border border-gray-700 p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Ethereum Blockchain
                </h1>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-300 to-purple-300 bg-clip-text text-transparent">
                  Security Ledger
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {verification && (
                <div className={`px-6 py-3 rounded-2xl text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
                  verification.isValid 
                    ? 'bg-green-500/10 border-green-500/30 text-green-200' 
                    : 'bg-red-500/10 border-red-500/30 text-red-200'
                }`}>
                  {verification.isValid ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Blockchain Available
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Blockchain Unavailable
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={fetchBlockchainData}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg border border-purple-500/30 hover:border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <p className="text-gray-300 text-lg max-w-2xl mb-8">
            {verification?.isValid 
              ? "Immutable medical record hashes secured on Ethereum blockchain with MetaMask integration."
              : verification?.message || "Blockchain integration is currently unavailable. Medical records are stored locally."
            }
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">Total Records</span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {blockchainStats?.totalRecords || 0}
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Patients</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {blockchainStats?.totalPatients || 0}
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Network</span>
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {blockchainStats?.network?.name || 'Disconnected'}
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Status</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {verification?.isValid ? 'Connected' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Connection Status */}
      <BlockchainStatus onUpdate={fetchBlockchainData} />

      {/* Record Verification Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Verify Medical Record</h3>
            <p className="text-gray-400">Enter a record hash to verify its existence on the blockchain</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter record hash (0x...)"
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={handleVerifyRecord}
              disabled={verifyLoading || !verifyHash.trim() || !verification?.isValid}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {verifyLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Verify
            </button>
          </div>

          {!verification?.isValid && (
            <div className="p-4 rounded-xl border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{verification?.message || 'Blockchain verification is currently unavailable. Please check your connection or deploy the smart contract.'}</span>
              </div>
            </div>
          )}

          {verifyResult && (
            <div className={`p-4 rounded-xl border ${
              verifyResult.success && verifyResult.exists
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {verifyResult.success && verifyResult.exists ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Record verified on blockchain</span>
                    <button
                      onClick={() => handleGetRecordDetails(verifyHash)}
                      className="ml-auto text-sm underline hover:no-underline"
                    >
                      View Details
                    </button>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    <span>{verifyResult.error || 'Record not found on blockchain'}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-600 bg-clip-text text-transparent">
                Blockchain Record Details
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    Patient ID
                  </label>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-sm text-purple-300 flex items-center justify-between">
                    <span>{selectedRecord.patientId}</span>
                    <button
                      onClick={() => copyToClipboard(selectedRecord.patientId)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Timestamp
                  </label>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-sm text-blue-300">
                    {formatTimestamp(selectedRecord.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Record Hash
                </label>
                <div className="bg-gray-800/50 p-3 rounded-lg text-sm font-mono break-all text-green-300 flex items-center justify-between">
                  <span>{selectedRecord.recordHash}</span>
                  <button
                    onClick={() => copyToClipboard(selectedRecord.recordHash)}
                    className="text-gray-400 hover:text-white transition-colors ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Record Type
                </label>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <span className="text-sm px-3 py-1 rounded-full font-medium bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30">
                    {selectedRecord.recordType}
                  </span>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  Authorized By
                </label>
                <div className="bg-gray-800/50 p-3 rounded-lg text-sm font-mono break-all text-yellow-300 flex items-center justify-between">
                  <span>{formatAddress(selectedRecord.authorizedBy)}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(selectedRecord.authorizedBy)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {blockchainStats?.network && (
                      <a
                        href={`${blockchainStats.network.blockExplorerUrls?.[0]}address/${selectedRecord.authorizedBy}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-600/50 hover:border-gray-500/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Information */}
      {blockchainStats && blockchainStats.contractAddress && (
        <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Smart Contract Information</h3>
              <p className="text-gray-400">Deployed contract details and network information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Contract Address</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-mono">{formatAddress(blockchainStats.contractAddress)}</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(blockchainStats.contractAddress)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {blockchainStats.network?.blockExplorerUrls?.[0] && (
                      <a
                        href={`${blockchainStats.network.blockExplorerUrls[0]}address/${blockchainStats.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Network</p>
                <p className="text-sm text-white">{blockchainStats.network?.name || 'Unknown'} (Chain ID: {blockchainStats.network?.chainId || 'N/A'})</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Total Patients</p>
                <p className="text-2xl font-bold text-blue-400">{blockchainStats.totalPatients}</p>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Total Records</p>
                <p className="text-2xl font-bold text-purple-400">{blockchainStats.totalRecords}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {(!blockchainStats || !verification?.isValid) && !loading && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl border border-gray-700/50">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Blockchain Not Available</h3>
          <p className="text-gray-400 mb-6">The blockchain integration is currently unavailable. This could be due to:</p>
          <ul className="text-gray-400 text-sm mb-6 space-y-1">
            <li>• Smart contract not deployed</li>
            <li>• Network connection issues</li>
            <li>• Missing environment configuration</li>
            <li>• MetaMask not connected</li>
          </ul>
          <button
            onClick={fetchBlockchainData}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Retry Connection'}
          </button>
        </div>
      )}
    </div>
  );
};