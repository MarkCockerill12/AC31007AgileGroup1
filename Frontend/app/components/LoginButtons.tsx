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

export function LoginButtons({ setCardNumber, setPIN, setShowSummary, setResponse }: LoginButtonsProps) {
  const { t } = useTranslation()
  const [selectedAccount, setSelectedAccount] = useState<{ CardNumber: number } | null>(null)
  const [enteredPIN, setEnteredPIN] = useState("")
  const [loginAttempts, setLoginAttempts] = useState(0)
  const { showPopup, popupMessage, showErrorPopup, closeErrorPopup } = useErrorPopup()
  const accounts = [
    { CardNumber: 5555555555554444, displayNumber: "5555 5555 5555 4444" },
    { CardNumber: 4111111111111111, displayNumber: "4111 1111 1111 1111" },
    { CardNumber: 378282246310005, displayNumber: "3782 8224 6310 005" },
    { CardNumber: 378734193589014, displayNumber: "3787 3419 3589 014" },
  ]

  const handleAccountSelect = (account: typeof accounts[number]) => {
    setSelectedAccount(account)
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
      showErrorPopup("Please select an account first.")
      return
    }

    if (enteredPIN.length !== 4) {
      showErrorPopup("Please enter a 4-digit PIN.")
      return
    }

    try {
      const response = await handleSendTransaction(
        0, // Balance inquiry transaction
        0,
        selectedAccount.CardNumber,
        Number.parseInt(enteredPIN),
        setResponse,
      )
      
      switch (response.RespType) {
        case 0:
          setCardNumber(selectedAccount.CardNumber)
          setPIN(enteredPIN)
          setShowSummary(true)
          break
        case 2:
          setLoginAttempts((prev) => prev + 1)
          if (loginAttempts >= 2) {
            showErrorPopup("Incorrect PIN. Last attempt remaining", () => window.location.reload())
          } else {
            showErrorPopup(`Incorrect PIN. ${3 - loginAttempts} attempts remaining`)
          }
          break
        case 3:
          showErrorPopup("Card blocked. Please contact support.", () => window.location.reload())
          break
        case 4:
          showErrorPopup("Card not recognized.", () => window.location.reload())
          break
        case 5:
          showErrorPopup("Card expired.", () => window.location.reload())
          break
        default:
          showErrorPopup("System error. Please try again later.", () => window.location.reload())
      }
    } catch (err) {
      showErrorPopup("Connection error. Please try again.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h2 className="text-white text-4xl mb-10 font-extrabold">{selectedAccount ? t.enterPIN : t.selectAccount}</h2>
      {!selectedAccount ? (
        <div className="grid grid-cols-2 gap-8">
          {accounts.map((account, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center cursor-pointer group"
              onClick={() => handleAccountSelect(account)}
            >
              <div className="relative flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-ncr-blue-900 to-ncr-blue-500 opacity-0 group-hover:opacity-25 rounded-xl transition-opacity" />
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-ncr-blue-300">
                    <div className="w-48 h-32 bg-gradient-to-br from-ncr-blue-500 to-ncr-blue-700 rounded-lg flex items-center justify-center">
                      <div className="text-white font-mono tracking-wider">
                        {formatCardNumber(account.CardNumber)}
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div className="text-white font-medium mt-4 text-center">
                  NCR Premier Banking
                  <div className="text-sm opacity-75 mt-1">Account {index + 1}</div>
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
          <div className="mb-4 text-center">
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
              onClick={() => setSelectedAccount(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {t.cancel}
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
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">NCR</div>

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