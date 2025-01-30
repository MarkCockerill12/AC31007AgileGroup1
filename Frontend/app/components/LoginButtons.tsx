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
}

export function LoginButtons({ setCardNumber, setPIN, setShowSummary, setResponse }: LoginButtonsProps) {
  const { t } = useTranslation()
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [enteredPIN, setEnteredPIN] = useState("")
  const [loginAttempts, setLoginAttempts] = useState(0)
  const { showPopup, popupMessage, showErrorPopup, closeErrorPopup } = useErrorPopup()
  const accounts = [
    { CardNumber: 5555555555554444 }, //the pin is 1234
    { CardNumber: 4111111111111111 }, // the pin is 6789
    { CardNumber: 378282246310005 }, // the pin is
    { CardNumber: 378734193589014 }, // the pin is 1234
  ]

  const handleAccountSelect = (account) => {
    setSelectedAccount(account)
    setCardNumber(account.CardNumber)
  }

  const handlePINInput = (value: string) => {
    if (enteredPIN.length < 4) {
      setEnteredPIN((prev) => prev + value)
    }
  }

  const handlePINDelete = () => {
    setEnteredPIN((prev) => prev.slice(0, -1))
  }

  const handleLogin = async () => {
    if (selectedAccount && enteredPIN.length === 4) {
      try {
        const response = await handleSendTransaction(
          0,
          0,
          selectedAccount.CardNumber,
          Number.parseInt(enteredPIN),
          setResponse,
        )
        if (response.RespType === 0) {
          setPIN(enteredPIN)
          setShowSummary(true)
        } else if (response.RespType === 2) {
          setLoginAttempts((prev) => prev + 1)
          if (loginAttempts >= 2) {
            window.location.reload()
          }
        } else {
          showErrorPopup(response.msg)
        }
      } catch (err) {
        showErrorPopup(err.message)
      }
    } else if (!selectedAccount) {
      showErrorPopup("Please select an account first.")
    } else if (enteredPIN.length !== 4) {
      showErrorPopup("Please enter a 4-digit PIN.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h2 className="text-white text-4xl mb-10 font-extrabold">{selectedAccount ? t.enterPIN : t.selectAccount}</h2>
      {!selectedAccount ? (
        <div className="flex space-x-4">
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
                ></motion.div>
                <div className="text-white font-bold m-2 p-2 mt-2 duration-200 group-hover:scale-125">
                  {t.account} {index + 1}
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
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-black text-2xl mb-4 font-extrabold">Error</h2>
            <p>{popupMessage}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={closeErrorPopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

