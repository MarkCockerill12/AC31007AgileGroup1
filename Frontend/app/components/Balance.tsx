import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { handleSendTransaction } from '../transactionUtils';

interface BalanceProps {
  CardNumber: number;
  PIN: number;
  balance: number;
  setBalance: (balance: number) => void;
  setShowSummary: (show: boolean) => void;
  setResponse: (response: string) => void;
}

export function Balance({ CardNumber, PIN, balance, setBalance, setShowSummary, setResponse }: BalanceProps) {
  const { t } = useTranslation();

  const handleGoBack = () => {
    setShowSummary(false);
  };

  const handleBalance = async () => {
    try {
      const response = await handleSendTransaction(0, 0, CardNumber, PIN, setResponse);
      if (response.RespType === 0) {
        const newBalance = Number.parseFloat(response.msg);
        setBalance(newBalance);
      }
    } catch (error) {
      console.error("Balance request failed:", error);
      setResponse("Failed to fetch balance");
    }
  };

  // Call handleBalance when component mounts
  useEffect(() => {
    handleBalance();
  }, []); // Empty dependency array means this runs once on mount

  const displayBalance = balance.toFixed(2);


  return (
    <>
      <motion.div
        className="text-center bg-white p-4 rounded shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-black text-2xl mb-4 font-extrabold">{t.balance}</h2>

        <div className="flex justify-between text-black mb-2">
          <span className="font-bold">{t.balance}:</span>
          <span>£{balance}</span>
        </div>
      </motion.div>
      <div className=" mt-4 ml-4 flex items-center duration-200 hover:scale-125">
        <img src="/assets/backButton.png" alt="Back Icon" className="w-6 h-6 cursor-pointer " onClick={handleGoBack} />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleGoBack}
        >
          {t.goBack}
        </motion.button>
      </div>
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">NCR</div>
    </>
  );
}