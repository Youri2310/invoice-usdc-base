"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Éviter l'hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="px-4 py-2 bg-gray-200 rounded-lg">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          {chain && (
            <span className="ml-2 text-gray-600">({chain.name})</span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Utilise le premier connecteur disponible
  const connector = connectors[0];

  return (
    <button
      onClick={() => connector && connect({ connector })}
      disabled={!connector}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Connect Wallet
    </button>
  );
}
