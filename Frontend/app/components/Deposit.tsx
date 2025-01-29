import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { handleSendTransaction } from '../transactionUtils';

interface DepositProps {
  CardNumber: string;
  PIN: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  setShowSummary: (show: boolean) => void;
  setTransactionAmount: (amount: number) => void;
  setResponse: React.Dispatch<React.SetStateAction<string>>;
}

export function Deposit({ CardNumber, PIN, balance, setBalance, setShowSummary, setTransactionAmount, setResponse }: DepositProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const { t } = useTranslation();

  const handleDeposit = (amount: number) => {
    if (amount > 0) {
      setTransactionAmount(amount);
      setBalance(balance + amount);
      handleSendTransaction(2, amount, CardNumber, PIN, setResponse); // 2 for deposit
      setShowSummary(true);
    } else {
      setShowPopup(true);
    }
  };

  const handleGoBack = () => {
    setShowSummary(true);
  };

  const invalidTransaction = () => {
    setShowPopup(false);
    window.location.reload();
  };

  return (
    <>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-white text-2xl mb-4 font-extrabold">{t.deposit}</h2>
        <div className="flex justify-between text-white mb-2">
          <span className="font-bold">{t.accountNumber}:</span>
          <span>{CardNumber}</span>
        </div>
        <div className="flex justify-between text-white mb-10">
          <span className="font-bold">{t.balance}:</span>
          <span>£{balance}</span>
        </div>

        <h2 className="text-white text-2xl mb-4">{t.depositAmount}</h2>

        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          {["1", "5", "10", "20", "50", "100"].map((amount) => (
            <button
              key={amount}
              className="mt-2 px-4 py-2 m-2 bg-white text-black rounded-full hover:scale-125"
              onClick={() => handleDeposit(Number.parseInt(amount))}
            >
              £{amount}
            </button>
          ))}
        </div>
        <div className="grid">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
            placeholder="Custom Amount"
            min="1"
          />
          <button
            className="mt-4 m-2 px-4 py-2 bg-white text-black rounded hover:scale-125"
            onClick={() => handleDeposit(Number.parseInt(customAmount))}
          >
            {t.depositCustomAmount}
          </button>
        </div>
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded">
              <p>{t.invalidTransaction}</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={invalidTransaction}
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </motion.div>
      <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img src="/assets/backButton.png" alt="Back Icon" className="w-6 h-6 cursor-pointer" onClick={handleGoBack} />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-125"
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
