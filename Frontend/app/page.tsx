"use client"

import "./globals.css"
import Link from "next/link"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { Code, Palette, Gamepad, Lightbulb } from "lucide-react"

export default function App() {
  const [showNumericField, setShowNumericField] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [accountNumber, setAccountNumber] = useState("")
  const [pinNumber, setPinNumber] = useState("")
  const [balance, setBalance] = useState(1000) // Initial balance

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {showSummary ? (
        <Summary
          accountNumber={accountNumber}
          pinNumber={pinNumber}
          balance={balance}
          setBalance={setBalance}
          setShowSummary={setShowSummary}
        />
      ) : showNumericField ? (
        <NumericInput setShowSummary={setShowSummary} setAccountNumber={setAccountNumber} setPinNumber={setPinNumber} />
      ) : (
        <Home onButtonClick={() => setShowNumericField(true)} />
      )}
    </div>
  )
}

function Home({ onButtonClick }) {
  return (
    <div className="text-center">
      <motion.h1
        className="mainText text-center text-4xl md:text-6xl font-bold mb-4 font-press-start-2p"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        NCR ATM
      </motion.h1>
      <motion.h2
        className="text-center text-2xl md:text-3xl mb-8 text-blue-500 dark:text-blue-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Glory to the New California Republic
      </motion.h2>

      <motion.p
        className="text-center text-xl mb-8 max-w-2xl mx-auto text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        To Start Entering Your Transaction, Click Below
      </motion.p>

      <motion.button
        className="animate-ping text-center text-xl mt-4 px-4 py-2 text-white font-bold rounded"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        onClick={onButtonClick}
      >
        Enter PIN you pompous tard
      </motion.button>
    </div>
  )
}

interface NumericInputProps {
  setShowSummary: (show: boolean) => void
  setAccountNumber: (accountNumber: string) => void
  setPinNumber: (pinNumber: string) => void
}

function NumericInput({ setShowSummary, setAccountNumber, setPinNumber }: NumericInputProps) {
  const [accountNumber, setLocalAccountNumber] = useState("")
  const [pinNumber, setLocalPinNumber] = useState("")
  const [isEnteringPin, setIsEnteringPin] = useState(false)

  const handleKeypadClick = (value: string) => {
    if (value === "Back") {
      if (isEnteringPin) {
        if (pinNumber.length > 0) {
          setLocalPinNumber(pinNumber.slice(0, -1))
        } else {
          setIsEnteringPin(false)
        }
      } else {
        if (accountNumber.length > 0) {
          setLocalAccountNumber(accountNumber.slice(0, -1))
        }
      }
    } else if (value === "Enter") {
      if (!isEnteringPin) {
        setIsEnteringPin(true)
      } else {
        setAccountNumber(accountNumber)
        setPinNumber(pinNumber)
        setShowSummary(true)
      }
    } else {
      if (isEnteringPin) {
        setLocalPinNumber((prev) => prev + value)
      } else {
        setLocalAccountNumber((prev) => prev + value)
      }
    }
  }

  const handleGoBack = () => {
    window.location.reload()
  }

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label htmlFor="numeric-field" className="text-white font-bold mb-2">
        {isEnteringPin ? "Enter your PIN" : "Enter your Account Number"}
      </label>
      <input
        type="text"
        value={isEnteringPin ? pinNumber : accountNumber}
        readOnly
        className="border p-2 mb-4 border-gray-300 text-black"
        id="numeric-field"
        aria-live="polite"
      />
      <div className="grid grid-cols-3 gap-2 mt-2 rounded-md" role="group" aria-label="Numeric keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Back", "0", "Enter"].map((button) => (
          <button
            key={button}
            className="text-white font-extrabold p-1 text-center transition-transform size-16 duration-200 hover:scale-150"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleKeypadClick(button)}
            aria-label={button}
          >
            {button}
          </button>
        ))}
      </div>
      <button
        className="mt-4 px-4 py-2 text-white font-bold rounded fixed bottom-0 right-0 mb-4 ml-4"
        onClick={handleGoBack}
        aria-label="Go back to main screen"
      >
        Go Back
      </button>
    </motion.div>
  )
}

function Summary({ accountNumber, pinNumber, balance, setBalance, setShowSummary }) {
  const [action, setAction] = useState(null)
  const [transactionAmount, setTransactionAmount] = useState(0)

  if (action === "withdraw") {
    return (
      <Withdraw
        accountNumber={accountNumber}
        pinNumber={pinNumber}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={setTransactionAmount}
      />
    )
  } else if (action === "deposit") {
    return (
      <Deposit
        accountNumber={accountNumber}
        pinNumber={pinNumber}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={setTransactionAmount}
      />
    )
  }

  const handleGoBack = () => {
    window.location.reload()
  }

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-white text-2xl mb-4">Account Summary</h2>
      <p className="text-white mb-2">Account Number: {accountNumber}</p>
      <p className="text-white mb-2">Balance: £{balance}</p>
      <p className="text-white mb-2">Last Transaction: £{transactionAmount}</p>

      <button className="mt-4 m-2 px-4 py-2 bg-white text-black rounded" onClick={() => setAction("withdraw")}>
        Withdraw
      </button>
      <button className="mt-4 m-2 px-4 py-2 bg-white text-black rounded" onClick={() => setAction("deposit")}>
        Deposit
      </button>
      <button
        className="mt-4 px-4 py-2 text-white font-bold rounded fixed bottom-0 right-0 mb-4 ml-4"
        onClick={handleGoBack}
        aria-label="Go back to main screen"
      >
        Sign Out
      </button> 
    </motion.div>

  )
}

function Withdraw({ accountNumber, pinNumber, balance, setBalance, setShowSummary, setTransactionAmount }) {
  const [customAmount, setCustomAmount] = useState("")

  const handleWithdraw = (amount) => {
    if (amount <= balance && amount > 0) {
      setTransactionAmount(amount)
      setBalance(balance - amount)
      setShowSummary(true)
    } else {
      alert("Invalid amount")
    }
  }

  const handleGoBack = () => {
    setShowSummary(true)
  }

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className=" text-white text-2xl mb-4">Withdraw</h2>
      <p className="text-white mb-2">Account Number: {accountNumber}</p>
      <p>PIN Number: {pinNumber}</p>
      <p className="text-white mb-2">Balance: £{balance}</p>

      <h2 className=" text-white text-2xl mb-4">Withdraw how much?</h2>

      {["5", "10", "20", "50", "100"].map((amount) => (
        <button
          key={amount}
          className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
          onClick={() => handleWithdraw(Number.parseInt(amount))}
        >
          £{amount}
        </button>
      ))}
      <input
        type="number"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
        placeholder="Custom Amount"
        min="1"
      />
      <button
        className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
        onClick={() => handleWithdraw(Number.parseInt(customAmount))}
      >
        Withdraw Custom Amount
      </button>

      <button
        className="mt-4 px-4 py-2 text-white font-bold rounded fixed bottom-0 right-0 mb-4 ml-4"
        onClick={handleGoBack}
      >
        Go Back
      </button>
    </motion.div>
  )
}

function Deposit({ accountNumber, pinNumber, balance, setBalance, setShowSummary, setTransactionAmount }) {
  const [customAmount, setCustomAmount] = useState("")

  const handleDeposit = (amount) => {
    if (amount > 0) {
      setTransactionAmount(amount)
      setBalance(balance + amount)
      setShowSummary(true)
    } else {
      alert("Invalid amount")
    }
  }

  const handleGoBack = () => {
    setShowSummary(true)
  }

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className=" text-white text-2xl mb-4">Deposit</h2>
      <p className="text-white mb-2">Account Number: {accountNumber}</p>
      <p>PIN Number: {pinNumber}</p>
      <p className="text-white mb-2">Balance: £{balance}</p>

      <h2 className=" text-white text-2xl mb-4">Deposit how much?</h2>

      {["5", "10", "20", "50", "100"].map((amount) => (
        <button
          key={amount}
          className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
          onClick={() => handleDeposit(Number.parseInt(amount))}
        >
          £{amount}
        </button>
      ))}
      <input
        type="number"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
        placeholder="Custom Amount"
        min="1"
      />
      <button
        className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
        onClick={() => handleDeposit(Number.parseInt(customAmount))}
      >
        Deposit Custom Amount
      </button>

      <button
        className="mt-4 px-4 py-2 text-white font-bold rounded fixed bottom-0 right-0 mb-4 ml-4"
        onClick={handleGoBack}
      >
        Go Back
      </button>
    </motion.div>
  )
}
