import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  RefreshCw,
  Copy,
  Eye
} from 'lucide-react';
import blockchainService from '../services/blockchainService';

export const BlockchainStatus = ({ onUpdate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount(null);
      setStats(null);
    } else {
      setAccount(accounts[0]);
      checkConnection();
    }
    // Notify parent component of the change
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const checkConnection = async () => {
    try {
      if (blockchainService.isConnected()) {
        setIsConnected(true);
        setAccount(blockchainService.getCurrentAccount());
        await fetchStats();
      } else {
        setIsConnected(false);
        setAccount(null);
        setStats(null);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setError(error.message);
      setIsConnected(false);
      setAccount(null);
      setStats(null);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await blockchainService.getBlockchainStats();
      if (result.success) {
        setStats(result.stats);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
      setError(error.message);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await blockchainService.connectWallet();
      if (result.success) {
        setIsConnected(true);
        setAccount(result.account);
        await fetchStats();
        // Notify parent component of successful connection
        if (onUpdate) {
          onUpdate();
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return blockchainService.formatAddress ? 
      blockchainService.formatAddress(address) : 
      `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Blockchain Connection</h3>
              <p className="text-sm text-gray-400">Connect your wallet to enable blockchain features</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <span className="text-sm text-orange-400">Disconnected</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          <span>{loading ? 'Connecting...' : 'Connect MetaMask'}</span>
        </button>

        {!blockchainService.isMetaMaskInstalled || !blockchainService.isMetaMaskInstalled() ? (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              MetaMask not detected. 
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 underline hover:text-yellow-300"
              >
                Install MetaMask
              </a>
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Blockchain Connected</h3>
            <p className="text-sm text-gray-400">Secure medical records on blockchain</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-sm text-green-400">Connected</span>
        </div>
      </div>

      {/* Account Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
          <div>
            <p className="text-xs text-gray-400">Connected Account</p>
            <p className="text-sm text-white font-mono">{formatAddress(account)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(account)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Copy address"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Toggle details"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-black/30 rounded-lg">
              <p className="text-xs text-gray-400">Patients on Chain</p>
              <p className="text-lg font-semibold text-blue-400">{stats.totalPatients || 0}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-lg">
              <p className="text-xs text-gray-400">Records on Chain</p>
              <p className="text-lg font-semibold text-purple-400">{stats.totalRecords || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Info */}
      {showDetails && stats && (
        <div className="space-y-3 pt-3 border-t border-gray-700/50">
          <div className="p-3 bg-black/30 rounded-lg">
            <p className="text-xs text-gray-400">Network</p>
            <p className="text-sm text-white">
              {stats.network?.name || 'Unknown'} 
              {stats.network?.chainId && ` (Chain ID: ${stats.network.chainId})`}
            </p>
          </div>
          
          {stats.contractAddress && (
            <div className="p-3 bg-black/30 rounded-lg">
              <p className="text-xs text-gray-400">Contract Address</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white font-mono">{formatAddress(stats.contractAddress)}</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(stats.contractAddress)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Copy contract address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {blockchainService.getExplorerUrl && (
                    <a
                      href={blockchainService.getExplorerUrl(stats.contractAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};