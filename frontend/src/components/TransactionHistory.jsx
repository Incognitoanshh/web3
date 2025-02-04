import { useState, useEffect } from "react";

const networks = {
  ethereum: { name: "Ethereum", api: "https://api.etherscan.io/api" },
  sepolia: { name: "Sepolia", api: "https://api-sepolia.etherscan.io/api" },
  polygon: { name: "Polygon", api: "https://api.polygonscan.com/api" },
  holesky: { name: "Holesky", api: "https://api-holesky.etherscan.io/api" },
  bsc: { name: "Binance Smart Chain", api: "https://api.bscscan.com/api" },
};

const TransactionExplorer = () => {
  const [network, setNetwork] = useState("ethereum");
  const [address, setAddress] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!address) return;

    setLoading(true);
    const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
    const apiUrl = `${networks[network].api}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.status === "1") {
        setTransactions(data.result.slice(0, 50)); // 50 transactions
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      {/* 🔗 Network Selector */}
      <div className="flex justify-center items-center mb-6">
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="p-3 border border-gray-600 rounded-lg text-black bg-white"
        >
          {Object.keys(networks).map((key) => (
            <option key={key} value={key}>
              {networks[key].name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔎 Search Bar */}
      <div className="flex justify-center items-center mb-6">
        <input
          type="text"
          placeholder="Enter Wallet / Contract Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="p-3 border border-gray-600 rounded-lg w-96 text-black bg-white"
        />
        <button
          onClick={fetchTransactions}
          className="ml-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded"
        >
          🔎 Search
        </button>
      </div>

      {/* 🌀 Loading Indicator */}
      {loading && <p className="text-center text-gray-400">🌀 Fetching transactions...</p>}

      {/* 📄 Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 text-white border border-gray-800">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="p-3">⏳ Time</th>
              <th className="p-3">🔄 Type</th>
              <th className="p-3">💰 USD</th>
              <th className="p-3">⛽ Gas Fee</th>
              <th className="p-3">🎯 Wallet</th>
              <th className="p-3">🔗 Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-3">{new Date(tx.timeStamp * 1000).toLocaleTimeString()}</td>
                  <td className="p-3">{tx.functionName || "Transfer"}</td>
                  <td className="p-3">${(parseFloat(tx.value) / 10 ** 18 * 2000).toFixed(2)}</td>
                  <td className="p-3">{(parseFloat(tx.gasPrice) / 10 ** 9).toFixed(2)} GWEI</td>
                  <td className="p-3">
                    <a href={`https://${network}.etherscan.io/address/${tx.from}`} target="_blank" className="text-blue-400">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </a>
                  </td>
                  <td className="p-3">
                    <a href={`https://${network}.etherscan.io/tx/${tx.hash}`} target="_blank" className="text-blue-400">
                      {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 p-3">
                  {address ? "No transactions found" : "Enter an address to see transactions"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionExplorer;
