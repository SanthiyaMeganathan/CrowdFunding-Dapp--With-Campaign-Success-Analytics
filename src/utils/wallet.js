export const getOkxProvider = () => {
  if (typeof window === "undefined") return null;
  return window.okxwallet || (window.ethereum?.isOkxWallet ? window.ethereum : null);
};
