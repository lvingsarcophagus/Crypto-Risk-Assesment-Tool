import { useState, useEffect, useCallback } from 'react';

interface WalletConnection {
  address: string;
  chainId: number;
  provider: string;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: number;
  price?: number;
  value?: number;
  usd_value?: number;
  logo?: string;
}

export function useWalletConnection() {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setWallet({
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              provider: 'MetaMask'
            });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connectWallet = useCallback(async (providerType: 'metamask' | 'walletconnect') => {
    setIsConnecting(true);
    try {
      if (providerType === 'metamask') {
        if (!window.ethereum) {
          throw new Error('MetaMask not installed');
        }

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        setWallet({
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          provider: 'MetaMask'
        });

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            setWallet(null);
            setTokens([]);
          } else {
            setWallet(prev => prev ? { ...prev, address: accounts[0] } : null);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId: string) => {
          setWallet(prev => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null);
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    setTokens([]);
  }, []);

  const fetchPortfolioTokens = useCallback(async () => {
    if (!wallet) return;

    setIsLoadingTokens(true);
    try {
      const response = await fetch('/api/portfolio/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: wallet.address,
          chainId: wallet.chainId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio tokens');
      }

      const data = await response.json();
      setTokens(data.tokens || []);
    } catch (error) {
      console.error('Error fetching portfolio tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  }, [wallet]);

  // Fetch tokens when wallet connects
  useEffect(() => {
    if (wallet) {
      fetchPortfolioTokens();
    }
  }, [wallet, fetchPortfolioTokens]);

  return {
    wallet,
    tokens,
    isConnecting,
    isLoadingTokens,
    connectWallet,
    disconnectWallet,
    refreshPortfolio: fetchPortfolioTokens,
  };
}
