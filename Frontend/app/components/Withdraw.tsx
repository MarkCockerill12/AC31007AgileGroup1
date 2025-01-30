import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { handleSendTransaction } from '../transactionUtils';

interface WithdrawProps {
  CardNumber: number;
  PIN: number;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  setShowSummary: (show: boolean) => void;
  setTransactionAmount: (amount: number) => void;
  setResponse: React.Dispatch<React.SetStateAction<string>>;
}

export function Withdraw({ CardNumber, PIN, balance, setBalance, setShowSummary, setTransactionAmount, setResponse }: WithdrawProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const { t } = useTranslation();

  const handleWithdraw = (amount: number) => {
    if (amount <= balance && amount > 0) {
      setTransactionAmount(amount);
      setBalance(balance - amount);
      handleSendTransaction(1, amount, CardNumber, PIN, setResponse); // 1 for withdrawal
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

  const handleKeypadInput = (value: string) => {
    setCustomAmount((prev) => prev + value);
  };

  const handleKeypadClear = () => {
    setCustomAmount("");
  };

  const handleKeypadDelete = () => {
    setCustomAmount((prev) => prev.slice(0, -1));
  };

  return (
      <>
        <motion.div
          className="text-center bg-white p-4 rounded shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-black text-2xl mb-4 font-extrabold">{t.withdrawal}</h2>


  
          <h2 className="text-black text-2xl mb-4">{t.withdrawAmount}</h2>
  
          <div className="grid grid-cols-3 grid-rows-2 gap-4">
            {["1", "5", "10", "20", "50", "100"].map((amount) => (
              <button
                key={amount}
                className="mt-2 px-4 py-2 m-2 bg-white text-black rounded-full hover:scale-110"
                onClick={() => handleWithdraw(Number.parseInt(amount))}
              >
                £{amount}
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-white text-black rounded duration-200 hover:scale-110"
              onClick={() => setShowKeypad(true)}
            >
              {t.withdrawCustomAmount}
            </button>
          </div>
          {showKeypad && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded">
                <input
                  type="text"
                  value={customAmount}
                  readOnly
                  className="mb-4 p-2 border border-gray-300 rounded w-full text-center"
                />
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
                    <button
                      key={num}
                      className="px-4 py-2 bg-gray-200 text-black rounded duration-200 hover:scale-110"
                      onClick={() => handleKeypadInput(num)}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="px-4 py-2 bg-gray-200 text-black rounded duration-200 hover:scale-110"
                    onClick={handleKeypadClear}
                  >
                    C
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-black rounded duration-200 hover:scale-110"
                    onClick={handleKeypadDelete}
                  >
                    ←
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-black rounded duration-200 hover:scale-110"
                    onClick={() => handleWithdraw(Number.parseInt(customAmount))}
                  >
                    OK
                  </button>
                </div>
                <button
                  className="mt-4 px-4 py-2 bg-gray-200 text-black rounded duration-200 hover:scale-110"
                  onClick={() => setShowKeypad(false)}
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded">
                <p>{t.invalidTransaction}</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-black rounded"
                  onClick={invalidTransaction}
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </motion.div>
        <div className="mt-8 flex items-center">
          <img
            src="/assets/backButton.png"
            alt="Back Icon"
            className="w-6 h-6 cursor-pointer mr-2"
            onClick={handleGoBack}
          />
          <button className="text-white font-bold text-lg hover:underline" onClick={handleGoBack}>
            {t.goBack}
          </button>
        </div>
        <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">NCR</div>
      </>
    );
  }