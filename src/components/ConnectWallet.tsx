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
      <div className="px-6 py-3 bg-gray-200 rounded-xl animate-pulse">
        <span className="text-gray-400 font-medium">Loading...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-mono text-sm font-medium text-gray-900">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            {chain && (
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md">
                {chain.name}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
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
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
    >
      Connect Wallet
    </button>
  );
}
