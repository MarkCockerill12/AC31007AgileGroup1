import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "../contexts/TranslationContext"
import { handleSendTransaction, useErrorPopup } from "../transactionUtils"
import type React from "react"

interface LoginButtonsProps {
  setCardNumber: (CardNumber: number) => void
  setPIN: (PIN: string) => void
  setShowSummary: (show: boolean) => void
  setResponse: React.Dispatch<React.SetStateAction<string>>
  setBalance: (balance: number) => void
}

// Helper function to format card numbers
const formatCardNumber = (num: number) => {
  const str = num.toString().replace(/\D/g, '');
  return `**** **** **** ${str.slice(-4)}`;
};

export function LoginButtons({ setCardNumber, setPIN, setShowSummary, setResponse, setBalance }: LoginButtonsProps) {
  const { t } = useTranslation()
  const [selectedAccount, setSelectedAccount] = useState<{ CardNumber: number } | null>(null)
  const [enteredPIN, setEnteredPIN] = useState("")
  const [loginAttempts, setLoginAttempts] = useState(0)
  const { showPopup, popupMessage, showErrorPopup, closeErrorPopup } = useErrorPopup()
  
  const accounts = [
    { CardNumber: 5555555555554444, displayNumber: "5555 5555 5555 4444" }, //the pin is 1234
    { CardNumber: 4111111111111111, displayNumber: "4111 1111 1111 1111" }, //the pin is 6789
    { CardNumber: 378282246310005, displayNumber: "3782 8224 6310 005" }, //the pin is 8901
    { CardNumber: 378734193589014, displayNumber: "3787 3419 3589 014" }, //pin is 1234
  ]

  const handleAccountSelect = (account: typeof accounts[number]) => {
    setSelectedAccount(account)
  }

  const handlePINClear = () => {
    setEnteredPIN("")
  }

  const handlePINDelete = () => {
    setEnteredPIN((prev) => prev.slice(0, -1))
  }

  const handlePINInput = (value: string) => {
    if (enteredPIN.length < 4) {
      setEnteredPIN((prev) => prev + value)
    }
  }

  const handleLogin = async () => {
    if (!selectedAccount) {
      showErrorPopup("Please select an account first.");
      return;
    }
  
    if (enteredPIN.length !== 4) {
      showErrorPopup("Please enter a 4-digit PIN.");
      return;
    }
  
    try {
      const loginResponse = await handleSendTransaction(
        0,
        0,
        selectedAccount.CardNumber,
        Number.parseInt(enteredPIN),
        setResponse,
      );
      
      if (loginResponse.RespType === 0) {
        const balanceResponse = await handleSendTransaction(
          3,
          0,
          selectedAccount.CardNumber,
          Number.parseInt(enteredPIN),
          setResponse,
        );
  
        if (balanceResponse.RespType === 0) {
          const newBalance = Number.parseFloat(balanceResponse.msg);
          setBalance(newBalance);
          setCardNumber(selectedAccount.CardNumber);
          setPIN(enteredPIN);
          setShowSummary(true);
        } else {
          showErrorPopup("Could not fetch balance. Please try again.");
        }
      } else {
        switch (loginResponse.RespType) {
          case 1:
          case 2:
            setLoginAttempts(prev => {
              const newAttempts = prev + 1;
              if (newAttempts >= 4) { // Last attempt
                showErrorPopup(t.errors.incorrectPinLast, () => window.location.reload());
              } else { // Still has attempts remaining
                showErrorPopup(t.errors.incorrectPinAttempts.replace("{attempts}", (4 - newAttempts).toString()));
              }
              return newAttempts;
            });
            break;
          case 3:
            showErrorPopup(t.errors.cardBlocked, () => window.location.reload());
            break;
          case 4:
            showErrorPopup(t.errors.cardNotRecognized, () => window.location.reload());
            break;
          case 5:
            showErrorPopup(t.errors.cardExpired, () => window.location.reload());
            break;
          default:
            showErrorPopup(t.errors.systemError, () => window.location.reload());
        }
      }
    } catch (err) {
      showErrorPopup(t.errors.connectionError);
    }
    setEnteredPIN("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h2 className="text-white text-4xl mb-10 font-extrabold">
        {selectedAccount ? t.enterPIN : t.selectAccount}
      </h2>
      
      {!selectedAccount ? (
        <div className="grid grid-cols-2 gap-8">
          {accounts.map((account, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleAccountSelect(account)}
            >
              <div className="relative group flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="relative"
                  style={{
                    backgroundImage: "url(/assets/enterCard.png)",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: "200px",
                    height: "150px",
                  }}
                  whileHover={{ backgroundImage: "url(/assets/enterCardHover.png)" }}
                  whileTap={{ backgroundImage: "url(/assets/enterCardOnClick.png)" }}
                />
                <div className="text-white font-bold m-2 p-2 mt-2 duration-200 group-hover:scale-125">
                <div className="text-sm mt-1">{t.account} {index + 1}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="mb-6 text-center">
            <div className="text-white font-mono tracking-wider mb-4">
              {formatCardNumber(selectedAccount.CardNumber)}
            </div>
            <input
              type="password"
              value={enteredPIN}
              readOnly
              className="w-full p-2 text-2xl text-center bg-gray-100 rounded"
              placeholder="****"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                className="p-4 text-white text-2xl font-bold rounded duration-200 hover:scale-110"
                onClick={() => handlePINInput(num.toString())}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {num}
              </motion.button>
            ))}
            <motion.button
              className="p-4 text-white text-2xl font-bold rounded duration-200 hover:scale-110"
              onClick={handlePINClear}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {t.clear}
            </motion.button>
            <motion.button
              className="p-4 text-white text-2xl font-bold rounded duration-200 hover:scale-110"
              onClick={() => handlePINInput("0")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              0
            </motion.button>
            <motion.button
              className="p-4 text-white text-2xl font-bold rounded duration-200 hover:scale-110"
              onClick={handlePINDelete}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ←
            </motion.button>
          </div>

          <motion.button
            className="w-full mt-4 p-4 text-white text-2xl font-bold rounded duration-200 hover:scale-110"
            onClick={handleLogin}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {t.login}
          </motion.button>
        </motion.div>
      )}

      <div className="mt-4 ml-4 flex items-center duration-200 hover:scale-110">
        <img
          src="/assets/backButton.png"
          alt="Back Icon"
          className="w-6 h-6 cursor-pointer"
          onClick={() => window.location.reload()}
        />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => window.location.reload()}
        >
          {t.goBack}
        </motion.button>
      </div>

      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">
        NCR
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
  )
}