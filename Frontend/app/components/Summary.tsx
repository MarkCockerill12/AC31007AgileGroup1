import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "../contexts/TranslationContext"
import { Withdraw } from "./Withdraw"
import { Deposit } from "./Deposit"
import { Balance } from "./Balance"
import { useErrorPopup } from '../transactionUtils';


interface SummaryProps {
  CardNumber: string
  PIN: string
  balance: number
  setBalance: React.Dispatch<React.SetStateAction<number>>
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>
  response: string
  setResponse: React.Dispatch<React.SetStateAction<string>>
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>
  currencyType: string;
  setCurrencyType: React.Dispatch<React.SetStateAction<string>>;
}

export function Summary({
  CardNumber,
  PIN,
  balance,
  setBalance,
  setShowSummary,
  response,
  setResponse,
  setShowBalance,
  currencyType,
  setCurrencyType
}: SummaryProps) {
  const [action, setAction] = useState(null)
  const { t } = useTranslation()
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [transactionKind, setTransactionKind] = useState(null)
  const { showPopup, popupMessage, showErrorPopup, closeErrorPopup } = useErrorPopup()
  const displayTransactionAmount = currencyType === "1" 
  ? `£${(transactionAmount * 0.7).toFixed(2)} ($${transactionAmount.toFixed(2)})` 
  : `£${transactionAmount.toFixed(2)}`;


  const handleAction = (actionType: string) => {
    try {
      setAction(actionType)
    } catch (error) {
      console.error("Error setting action:", error)
      showErrorPopup("An error occurred. Please try again.")
    }
  }

  if (action === "withdraw") {
    return (
      <Withdraw
        CardNumber={parseInt(CardNumber)}
        PIN={parseInt(PIN)}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={(amount) => {
          setTransactionAmount(amount)
          setTransactionKind("withdraw")
        }}
        setResponse={setResponse}
        currencyType={currencyType}
        setCurrencyType={setCurrencyType}
      />
    )
  } else if (action === "balance") {
    return (
      <Balance
        CardNumber={parseInt(CardNumber)}
        PIN={parseInt(PIN)}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setResponse={setResponse}
        currencyType={currencyType}
        setCurrencyType={setCurrencyType}
      />
    )
  } else if (action === "deposit") {
    return (
      <Deposit
        CardNumber={parseInt(CardNumber)}
        PIN={parseInt(PIN)}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={(amount) => {
          setTransactionAmount(amount)
          setTransactionKind("deposit")
        }}
        setResponse={setResponse}
        currencyType={currencyType}
        setCurrencyType={setCurrencyType}
      />
    )
  }

  const handleGoBack = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto px-4">
      <motion.div
        className="w-full bg-white p-8 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-black text-3xl mb-6 font-extrabold text-center">{t.accountSummary}</h2>
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex justify-between text-black text-lg">
            <span className="font-bold">{t.accountNumber}:</span>
            <span>{CardNumber}</span>
          </div>
          {transactionAmount > 0 && (
            <div className="flex justify-between text-black text-lg">
            <span className="font-bold">{t.lastTransaction}:</span>
            <span>
              {transactionKind === "withdraw" ? "-" : "+"}{displayTransactionAmount}
            </span>
          </div>
          )}
          <div className="flex justify-between text-black text-lg">
            <span className="font-bold">{t.response}:</span>
            <span>{response}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="p-4  text-black rounded-lg transition-transform duration-200 hover:scale-110 flex flex-col items-center justify-center"
            onClick={() => setAction("withdraw")}
          >
            <span className="text-2xl mb-2">{t.withdrawal}</span>
            <span className="text-sm">{t.withdrawDescription}</span>
          </button>
          <button
            className="p-4  text-black rounded-lg transition-transform duration-200 hover:scale-110 flex flex-col items-center justify-center"
            onClick={() => setAction("deposit")}
          >
            <span className="text-2xl mb-2">{t.deposit}</span>
            <span className="text-sm">{t.depositDescription}</span>
          </button>
          <button
            className="p-4 text-black rounded-lg transition-transform duration-200 hover:scale-110 flex flex-col items-center justify-center"
            onClick={() => setAction("balance")}
          >
            <span className="text-2xl mb-2">{t.balance}</span>
            <span className="text-sm">{t.balanceDescription}</span>
          </button>
        </div>
      </motion.div>
      <div className="mt-8 flex items-center duration-200 hover:scale-110">
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
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white text-4xl font-bold">NCR</div>
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