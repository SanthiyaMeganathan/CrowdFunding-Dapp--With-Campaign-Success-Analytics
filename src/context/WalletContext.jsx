// src/context/WalletContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "../utils/config";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.ethereum) return;

    const p = new ethers.BrowserProvider(window.ethereum);
    setProvider(p);

    (async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
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

    window.ethereum.on?.("accountsChanged", handleAccounts);
    window.ethereum.on?.("chainChanged", handleChain);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccounts);
      window.ethereum.removeListener?.("chainChanged", handleChain);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const p = provider || new ethers.BrowserProvider(window.ethereum);

    const net = await p.getNetwork();
    if (Number(net.chainId) !== DEFAULT_CHAIN) {
      alert("You tried to connect to another network. Please switch to Sepolia Testnet.");
      return;
    }

    await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    const addr = await s.getAddress();

    setProvider(p);
    setSigner(s);
    setAccount(addr);
    setChainId(net.chainId);

    return addr;
  };

  const disconnect = () => {
    setSigner(null);
    setAccount(null);
  };

  return (
    <WalletContext.Provider
      value={{ provider, signer, account, chainId, connectWallet, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// ✅ Hook to use the context
export const useWallet = () => useContext(WalletContext);
