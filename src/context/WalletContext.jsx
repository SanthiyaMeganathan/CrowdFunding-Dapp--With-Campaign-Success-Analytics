// src/context/WalletContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "../utils/config";
import { getOkxProvider } from "../utils/wallet";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    const walletProvider = getOkxProvider();
    if (!walletProvider) return;

    const p = new ethers.BrowserProvider(walletProvider);
    setProvider(p);

    (async () => {
      try {
        const accounts = await walletProvider.request({ method: "eth_accounts" });
        const net = await p.getNetwork();

        if (Number(net.chainId) !== DEFAULT_CHAIN) {
          alert("You are connected to the wrong network. Please switch to Sepolia Testnet.");
          return;
        }

        if (accounts?.length) {
          setAccount(accounts[0]);
          const s = await p.getSigner();
          setSigner(s);
        }

        setChainId(net.chainId);
      } catch (e) {
        console.debug("Wallet init:", e);
      }
    })();

    const handleAccounts = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        setSigner(null);
        setAccount(null);
      } else {
        const net = await p.getNetwork();
        if (Number(net.chainId) !== DEFAULT_CHAIN) {
          alert("Unsupported network detected. Please switch to Sepolia Testnet.");
          return;
        }
        setAccount(accounts[0]);
        const s = await p.getSigner();
        setSigner(s);
      }
    };

    const handleChain = async () => {
      try {
        const net = await p.getNetwork();
        if (Number(net.chainId) !== DEFAULT_CHAIN) {
          alert("Unsupported network detected. Please switch to Sepolia Testnet.");
          return;
        }
        setChainId(net.chainId);
      } catch (e) {
        console.debug("Chain change:", e);
      }
    };

    walletProvider.on?.("accountsChanged", handleAccounts);
    walletProvider.on?.("chainChanged", handleChain);

    return () => {
      walletProvider.removeListener?.("accountsChanged", handleAccounts);
      walletProvider.removeListener?.("chainChanged", handleChain);
    };
  }, []);

  const connectWallet = async () => {
    const walletProvider = getOkxProvider();
    if (!walletProvider) throw new Error("OKX Wallet not installed or not available");
    const p = provider || new ethers.BrowserProvider(walletProvider);

    // Clear the previous site authorization so OKX opens account selection.
    try {
      await walletProvider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (error) {
      if (error.code !== -32601 && error.code !== -32602) throw error;
    }

    await p.send("eth_requestAccounts", []);
    const net = await p.getNetwork();
    if (Number(net.chainId) !== DEFAULT_CHAIN) {
      alert("You tried to connect to another network. Please switch to Sepolia Testnet.");
      return;
    }

    const s = await p.getSigner();
    const addr = await s.getAddress();

    setProvider(p);
    setSigner(s);
    setAccount(addr);
    setChainId(net.chainId);

    return addr;
  };

  const switchAccount = async () => {
    const walletProvider = getOkxProvider();
    if (!walletProvider) throw new Error("OKX Wallet not installed or not available");

    try {
      // Revoke this site's permission first so OKX must show its account picker.
      await walletProvider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (error) {
      if (error.code === 4001) throw error;
      if (error.code !== -32601 && error.code !== -32602) throw error;
    }

    try {
      await walletProvider.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (error) {
      if (error.code === 4001) throw error;
      if (error.code !== -32601 && error.code !== -32602) throw error;
    }

    const accounts = await walletProvider.request({ method: "eth_requestAccounts" });
    const selectedAccount = accounts?.[0];
    if (!selectedAccount) throw new Error("No OKX Wallet account was selected");

    const p = provider || new ethers.BrowserProvider(walletProvider);
    const net = await p.getNetwork();
    if (Number(net.chainId) !== DEFAULT_CHAIN) {
      alert("You tried to connect to another network. Please switch to Sepolia Testnet.");
      return;
    }

    const s = await p.getSigner();
    setProvider(p);
    setSigner(s);
    setAccount(selectedAccount);
    setChainId(net.chainId);
    return selectedAccount;
  };

  const disconnect = async () => {
    const walletProvider = getOkxProvider();
    if (walletProvider) {
      try {
        await walletProvider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (error) {
        if (error.code !== -32601 && error.code !== -32602 && error.code !== 4001) {
          console.debug("OKX disconnect:", error);
        }
      }
    }
    setSigner(null);
    setAccount(null);
  };

  return (
    <WalletContext.Provider
      value={{ provider, signer, account, chainId, connectWallet, switchAccount, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// ✅ Hook to use the context
export const useWallet = () => useContext(WalletContext);
