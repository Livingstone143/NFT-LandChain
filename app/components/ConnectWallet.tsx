'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { Wallet } from 'lucide-react';

interface ConnectWalletProps {
  onConnect?: (address: string) => void;
}

// This is your WalletConnect project ID from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '54afd08bf7a54448055eb7068566985e';

const ConnectWallet = ({ onConnect }: ConnectWalletProps) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (typeof window !== 'undefined') {
        // Check localStorage first for a stored address
        const storedAddress = localStorage.getItem('walletAddress');
        const connectorType = localStorage.getItem('walletConnector');
        
        if (storedAddress) {
          setAddress(storedAddress);
          if (onConnect) onConnect(storedAddress);

          // If we were using WalletConnect before, try to reconnect
          if (connectorType === 'walletconnect') {
            try {
              await initWalletConnect(true);
            } catch (err) {
              console.error('Error reconnecting to WalletConnect:', err);
              // If reconnect fails, clear the stored data
              localStorage.removeItem('walletAddress');
              localStorage.removeItem('walletConnector');
              setAddress(null);
            }
          }
          
          return;
        }

        // If no stored address, check if MetaMask is connected
        if (window.ethereum) {
          try {
            const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await ethProvider.listAccounts();
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
              setProvider(ethProvider);
              localStorage.setItem('walletAddress', accounts[0]);
              localStorage.setItem('walletConnector', 'metamask');
              if (onConnect) onConnect(accounts[0]);
            }
          } catch (err) {
            console.error('Error checking connection:', err);
          }
        }
      }
    };
    
    checkConnection();

    // Set up event listener for MetaMask account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setAddress(null);
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('walletConnector');
        } else {
          // User changed accounts
          setAddress(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
          localStorage.setItem('walletConnector', 'metamask');
          if (onConnect) onConnect(accounts[0]);
        }
      };

      const ethereum = window.ethereum;
      ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [onConnect]);

  const initWalletConnect = async (reconnect = false) => {
    try {
      const wcProvider = await EthereumProvider.init({
        projectId,
        chains: [11155111], // Sepolia chain ID
        showQrModal: true,
        qrModalOptions: { themeMode: 'light' }
      });

      if (reconnect) {
        if (!wcProvider.connected) {
          await wcProvider.connect();
        }
      } else {
        await wcProvider.connect();
      }
      
      // Create ethers provider with WalletConnect
      const ethProvider = new ethers.providers.Web3Provider(wcProvider as any);
      setProvider(ethProvider);
      
      const accounts = await ethProvider.listAccounts();
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        localStorage.setItem('walletConnector', 'walletconnect');
        if (onConnect) onConnect(accounts[0]);
      }

      // Setup disconnect event
      wcProvider.on('disconnect', () => {
        setAddress(null);
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletConnector');
      });

      return wcProvider;
    } catch (err) {
      console.error('Error initializing WalletConnect:', err);
      throw err;
    }
  };

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);
    setShowOptions(false);
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      }
      
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      await ethProvider.send('eth_requestAccounts', []);
      setProvider(ethProvider);
      
      const signer = ethProvider.getSigner();
      const connectedAddress = await signer.getAddress();
      
      setAddress(connectedAddress);
      localStorage.setItem('walletAddress', connectedAddress);
      localStorage.setItem('walletConnector', 'metamask');
      if (onConnect) onConnect(connectedAddress);
    } catch (err: any) {
      console.error('Error connecting to MetaMask:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    setIsConnecting(true);
    setError(null);
    setShowOptions(false);
    
    try {
      await initWalletConnect();
    } catch (err: any) {
      console.error('Error connecting to WalletConnect:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnector');
    
    // If it was a WalletConnect connection, disable it
    if (provider && localStorage.getItem('walletConnector') === 'walletconnect') {
      // WalletConnect requires additional disconnect logic
      // But this is handled by the provider.on('disconnect') event
    }
    
    setProvider(null);
  };

  if (address) {
    return (
      <div className="flex items-center bg-white border rounded-md py-1 px-3 text-sm">
        <Wallet className="h-4 w-4 text-indigo-500 mr-2" />
        <span className="font-medium text-gray-900">
          {address.substring(0, 6)}...{address.substring(address.length - 4)}
        </span>
      </div>
    );
  }

  return (
    <div>
      {showOptions ? (
        <div className="relative z-10">
          <div className="fixed inset-0" onClick={() => setShowOptions(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
            <button
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              MetaMask
            </button>
            <button
              onClick={connectWalletConnect}
              disabled={isConnecting}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              WalletConnect
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowOptions(true)}
          disabled={isConnecting}
          className="flex items-center bg-white border rounded-md py-1 px-3 text-sm hover:bg-gray-50"
        >
          {isConnecting ? (
            'Connecting...'
          ) : (
            <>
              <Wallet className="h-4 w-4 text-indigo-500 mr-2" />
              <span className="text-gray-900">0x72d1...b02b <span className="text-xs text-gray-500">(0.0000 ETH)</span></span>
            </>
          )}
        </button>
      )}
      {error && (
        <p className="absolute mt-1 right-0 text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
};

export default ConnectWallet; 