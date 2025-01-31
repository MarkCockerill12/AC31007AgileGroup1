import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { handleSendTransaction } from '../transactionUtils';
import { useErrorPopup } from '../transactionUtils';

interface WithdrawProps {
  CardNumber: number;
  PIN: number;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  setShowSummary: (show: boolean) => void;
  setTransactionAmount: (amount: number) => void;
  setResponse: React.Dispatch<React.SetStateAction<string>>;
  currencyType: string;
  setCurrencyType: (type: string) => void;
}

export function Withdraw({ 
  CardNumber, 
  PIN, 
  balance, 
  setBalance, 
  setShowSummary, 
  setTransactionAmount, 
  setResponse,
  currencyType,
  setCurrencyType 
}: WithdrawProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);
  const { t } = useTranslation();
  const { showPopup, popupMessage, showErrorPopup, closeErrorPopup } = useErrorPopup();

  const handleWithdraw = async (amount: number) => {
    if (amount <= 0) {
      showErrorPopup(t.invalidAmount);
      return;
    }
  
    try {
      // Get current balance/currency first
      const balanceResponse = await handleSendTransaction(3, 0, CardNumber, PIN, setResponse);
      if (balanceResponse.RespType === 0) {
        setCurrencyType(balanceResponse.CrncyType);
        
        // Now handle withdrawal with correct currency conversion
        const convertedAmount = balanceResponse.CrncyType === "1" ? amount / 0.7 : amount;
        
        const response = await handleSendTransaction(1, convertedAmount, CardNumber, PIN, setResponse);
        if (response.RespType === 0) {
          setTransactionAmount(convertedAmount);
          setBalance(prev => prev - amount);
          setShowSummary(true);
        } else {
          showErrorPopup(response.msg);
        }
      } else {
        showErrorPopup(balanceResponse.msg);
      }
    } catch (error) {
      showErrorPopup(error.msg || "Connection error. Please try again.");
    }
  };

  const handleKeypadInput = (value: string) => {
    if (customAmount.length < 10) {
      setCustomAmount(prev => prev + value);
    }
  };

  const handleKeypadClear = () => setCustomAmount("");
  const handleKeypadDelete = () => setCustomAmount(prev => prev.slice(0, -1));

  const displayAmount = (amount: string) => {
    return currencyType === "1" 
      ? `$${amount}`
      : `£${amount}`;
  };

  // In your return statement, update the amount buttons display
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        className="text-center bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-black text-3xl mb-6 font-extrabold">{t.withdrawal}</h2>
        <h3 className="text-black text-xl mb-6">{t.withdrawAmount}</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
        {["10", "20", "50", "100", "150", "200"].map((amount) => (
          <motion.button
            key={amount}
            className="py-3 px-4 bg-white text-black border-2 border-gray-200 rounded-lg font-bold hover:bg-gray-50"
            onClick={() => handleWithdraw(Number(amount))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {`£${amount}`}
          </motion.button>
        ))}
        </div>

        <motion.button
          className="w-full py-3 px-4 bg-white text-black border-2 border-gray-200 rounded-lg font-bold mb-4"
          onClick={() => setShowKeypad(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t.withdrawCustomAmount}
        </motion.button>
      </motion.div>

      <div className="mt-6 flex items-center justify-center">
        <motion.button
          className="flex items-center text-white font-bold text-lg hover:underline"
          onClick={() => setShowSummary(true)}
          whileHover={{ scale: 1.1 }}
        >
          <img
            src="/assets/backButton.png"
            alt="Back"
            className="w-6 h-6 mr-2"
          />
          {t.goBack}
        </motion.button>
      </div>

      <div className="fixed top-0 right-0 mt-4 mr-4 text-white text-4xl font-bold">NCR</div>

      {showKeypad && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-xl text-black"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <input
                type="text"
                value={customAmount}
                readOnly
                className="w-full mb-4 p-3 text-center text-2xl border-2 rounded-lg"
                placeholder="£0.00"              />
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"].map((key) => (
                <motion.button
                  key={key}
                  className="p-4 text-xl font-bold bg-gray-100 rounded-lg text-black"
                  onClick={() => {
                    if (key === "C") handleKeypadClear();
                    else if (key === "←") handleKeypadDelete();
                    else handleKeypadInput(key);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {key}
                </motion.button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 ">
              <motion.button
                className="p-3 bg-gray-200 rounded-lg font-bold text-black"
                onClick={() => setShowKeypad(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.cancel}
              </motion.button>
              <motion.button
                className="p-3 bg-blue-500 text-white rounded-lg font-bold"
                onClick={() => {
                  handleWithdraw(Number(customAmount));
                  setShowKeypad(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.confirm}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

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
}``