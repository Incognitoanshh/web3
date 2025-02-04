import { useState, useEffect } from "react";
import { ethers } from "ethers";

const tokens = [
  { name: "Ethereum", symbol: "ETH", address: "0x0" },
  { name: "Tether", symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { name: "USD Coin", symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48" },
  { name: "Dai", symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
  { name: "Wrapped BTC", symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
  { name: "Chainlink", symbol: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA" },
  { name: "Polygon", symbol: "MATIC", address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0" },
  { name: "Binance Coin", symbol: "BNB", address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52" },
  { name: "Uniswap", symbol: "UNI", address: "0xCffdded873554F362Ac02f8Fb1F02E5Ada10516f" },
  { name: "AAVE", symbol: "AAVE", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" },
];

const UNVResolver = () => {
  const [sellToken, setSellToken] = useState(tokens[0]);
  const [buyToken, setBuyToken] = useState(tokens[1]);
  const [amount, setAmount] = useState("");
  const [conversionRate, setConversionRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState("0");

  useEffect(() => {
    fetchConversionRate();
    fetchBalance();
  }, [sellToken, buyToken]);

  const fetchConversionRate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${sellToken.name.toLowerCase()},${buyToken.name.toLowerCase()}&vs_currencies=usd`
      );
      const data = await response.json();
      setConversionRate(data[sellToken.name.toLowerCase()]?.usd / data[buyToken.name.toLowerCase()]?.usd);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
    setLoading(false);
  };

  const fetchBalance = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      if (sellToken.symbol === "ETH") {
        const balance = await provider.getBalance(userAddress);
        setUserBalance(ethers.utils.formatEther(balance));
      } else {
        setUserBalance("0"); // ERC20 Balance fetch karna h
      }
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-lg w-1/2 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Swap Tokens</h1>
      
      {/* Sell Token */}
      <div className="mb-4">
        <label className="block text-gray-400">Sell</label>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-3 bg-gray-800 w-full text-white rounded-lg"
        />
        <select
          className="p-3 bg-gray-700 w-full mt-2 text-white rounded-lg"
          value={sellToken.symbol}
          onChange={(e) => setSellToken(tokens.find(t => t.symbol === e.target.value))}
        >
          {tokens.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Buy Token */}
      <div className="mb-4">
        <label className="block text-gray-400">Buy</label>
        <div className="p-3 bg-gray-800 w-full text-white rounded-lg">
          {amount && conversionRate ? (amount * conversionRate).toFixed(4) : "0"} {buyToken.symbol}
        </div>
        <select
          className="p-3 bg-gray-700 w-full mt-2 text-white rounded-lg"
          value={buyToken.symbol}
          onChange={(e) => setBuyToken(tokens.find(t => t.symbol === e.target.value))}
        >
          {tokens.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Swap Button */}
      <button
        className={`w-full p-3 mt-4 rounded-lg font-bold ${
          parseFloat(amount) > parseFloat(userBalance) ? "bg-red-600" : "bg-blue-600 hover:bg-blue-800"
        }`}
        disabled={parseFloat(amount) > parseFloat(userBalance)}
      >
        {parseFloat(amount) > parseFloat(userBalance) ? "Insufficient Balance" : "Swap"}
      </button>

      {/* User Balance */}
      <p className="text-gray-400 text-sm mt-2">Your {sellToken.symbol} Balance: {userBalance}</p>
    </div>
  );
};

export default UNVResolver;
