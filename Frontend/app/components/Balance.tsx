import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { handleSendTransaction } from '../transactionUtils';
import { useErrorPopup } from '../transactionUtils';

interface BalanceProps {
  CardNumber: number;
  PIN: number;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  setShowSummary: (show: boolean) => void;
  setResponse: React.Dispatch<React.SetStateAction<string>>;
  currencyType: string;
  setCurrencyType: (type: string) => void;
}

export function Balance({ 
  CardNumber, 
  PIN, 
  balance, 
  setBalance, 
  setShowSummary, 
  setResponse,
  currencyType,
  setCurrencyType 
}: BalanceProps) {
  const { t } = useTranslation();
  const { showPopup, popupMessage, showErrorPopup, closeErrorPopup } = useErrorPopup();

  const handleBalance = async () => {
    try {
      const response = await handleSendTransaction(3, 0, CardNumber, PIN, setResponse);
      if (response.RespType === 0) {
        const newBalance = Number.parseFloat(response.msg);
        setBalance(newBalance);
        setCurrencyType(response.CrncyType);
      } else {
        showErrorPopup(response.msg, () => window.location.reload());
      }
    } catch (error) {
      console.error("Balance request failed:", error);
      showErrorPopup("Connection error. Please try again.", () => window.location.reload());
    }
  };

  useEffect(() => {
    handleBalance();
  }, []);

  const displayBalance = currencyType === "1" 
    ? `£${(balance * 0.7).toFixed(2)} ($${balance.toFixed(2)})` 
    : `£${balance.toFixed(2)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        className="text-center bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-black text-3xl mb-6 font-extrabold">{t.balance}</h2>
        <div className="flex justify-between text-black text-xl">
          <span className="font-bold">{t.balance}:</span>
          <span>{displayBalance}</span>
        </div>
      </motion.div>

      <div className="mt-6 flex items-center justify-center">
        <motion.button
          className="flex items-center text-white font-bold text-lg hover:underline"
          onClick={() => setShowSummary(true)}
          whileHover={{ scale: 1.1 }}
        >
          <img src="/assets/backButton.png" alt="Back" className="w-6 h-6 mr-2" />
          {t.goBack}
        </motion.button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <div className="text-ncr-blue-900 font-bold text-xl mb-4">NCR Banking</div>
            <p className="text-gray-700 mb-4">{popupMessage}</p>
            <button
              className="w-full bg-ncr-blue-500 hover:bg-ncr-blue-600 text-black font-bold py-2 px-4 rounded-lg transition-colors"
              onClick={closeErrorPopup}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}