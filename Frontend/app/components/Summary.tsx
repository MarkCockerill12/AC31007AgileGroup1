import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "../contexts/TranslationContext"
import { Withdraw } from "./Withdraw"
import { Deposit } from "./Deposit"
import { Balance } from "./Balance"

interface SummaryProps {
  CardNumber: string
  PIN: string
  balance: number
  setBalance: React.Dispatch<React.SetStateAction<number>>
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>
  response: string
  setResponse: React.Dispatch<React.SetStateAction<string>>
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>
}

export function Summary({ CardNumber, PIN, balance, setBalance, setShowSummary, response, setResponse, setShowBalance }: SummaryProps) {
  const [action, setAction] = useState(null)
  const { t } = useTranslation()
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [transactionKind, setTransactionKind] = useState(null)

  if (action === "withdraw") {
    return (
      <Withdraw
        CardNumber={CardNumber}
        PIN={PIN}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={(amount) => {
          setTransactionAmount(amount)
          setTransactionKind("withdraw")
        }}
        setResponse={setResponse}
      />
    )
  } else if (action === "balance") {
    return <Balance 
      CardNumber={CardNumber}
      balance={balance} 
      setShowSummary={() => setAction(null)} />
  } else if (action === "deposit") {
    return (
      <Deposit
        CardNumber={CardNumber}
        PIN={PIN}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={(amount) => {
          setTransactionAmount(amount)
          setTransactionKind("deposit")
        }}
        setResponse={setResponse}
      />
    )
  }

  const handleGoBack = () => {
    window.location.reload()
  }

  return (
    <>
      <motion.div
        className="text-center bg-white p-4 rounded shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-black text-2xl mb-4 font-extrabold">{t.accountSummary}</h2>
        <div className="flex justify-between text-black mb-2">
          <span className="font-bold">{t.accountNumber}:</span>
          <span>{CardNumber}</span>
        </div>
        <div className="flex justify-between text-black mb-2">
          <span className="font-bold">{t.lastTransaction}:</span>
          {transactionAmount > 0 && (
            <span>
              {transactionKind === "withdraw" ? "-" : "+"}£{transactionAmount}
            </span>
          )}
        </div>
        <div className="flex justify-between text-black mb-2">
          <span className="font-bold">{t.response}:</span>
          <span>{response}</span>
        </div>

        <button
          className="mt-4 m-6 px-4 py-2 bg-white text-black rounded transition-transform duration-200 hover:scale-125"
          onClick={() => setAction("withdraw")}
        >
          {t.withdrawal}
        </button>
        <button
          className="mt-4 m-6 px-4 py-2 bg-white text-black rounded transition-transform duration-200 hover:scale-125"
          onClick={() => setAction("deposit")}
        >
          {t.deposit}
        </button>
        <button
          className="mt-4 m-6 px-4 py-2 bg-white text-black rounded transition-transform duration-200 hover:scale-125"
          onClick={() => setAction("balance")}
        >
          {t.balance}
        </button>
      </motion.div>
      <div className=" mt-4 ml-4 flex items-center duration-200 hover:scale-125">
        <img src="/assets/backButton.png" alt="Back Icon" className="w-6 h-6 cursor-pointer" onClick={handleGoBack} />
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