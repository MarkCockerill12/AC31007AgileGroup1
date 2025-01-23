// This file serves as the actual "page" of the electron ATM app, encompassing all the UI elements and functionality
// Electron runs in Node.js, so we have access to various native APIs.
// Electron also allows multiple instances of the app to run simultaneously which suffices the need of the ATM to be able to support multiple users at once.
// 

"use client"


declare global {
  interface Window {
    electron: {
      sendTransaction: (transactionData: {atmID: string; TnxTime: string; TnxKind: number; TnxAmount: number;  CardNumber: number; PIN: number }) => Promise<string>;
    };
  }
}

// Import the global CSS styles that incorporate tailwind styles
import "./globals.css"
import Link from "next/link"
// Import react, usestate, motion for managing functional components and animations
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
// Import various icons from lucide-react for the UI
import { Code, Palette, Gamepad, Lightbulb } from "lucide-react"

// Defines the main functional component of the app
export default function App() {
  // Define variable for whether numeric input field should be shown
  const [showNumericField, setShowNumericField] = useState(false)
  // Define variable for whether summary should be shown
  const [showSummary, setShowSummary] = useState(false)
   // Define variables for account number and pin number
  const [CardNumber, setCardNumber] = useState("")
  const [PIN, setPIN] = useState("")
  const [balance, setBalance] = useState(1000) // Initial balance
  const [response, setResponse] = useState("");
  // function to handle send transaction and what transaction data is
  
  
  const handleSendTransaction = async () => {
    const atmID = "ATM123";
    const TnxTime = new Date().toISOString();
    const TnxKind = 1;
    const TnxAmount = 100;
  
    // Convert strings to integers
    const cardNumberInt = parseInt(CardNumber, 10);
    const pinInt = parseInt(PIN, 10);
  
    // Validate numbers
    if (isNaN(cardNumberInt) || isNaN(pinInt)) {
      setResponse('Invalid card number or PIN');
      return;
    }
  
    const transactionData = {
      atmID,
      TnxTime,
      TnxKind,
      TnxAmount,
      CardNumber: cardNumberInt,
      PIN: pinInt
    };
  
    try {
      console.log(transactionData);
      const res = await window.electron.sendTransaction(transactionData);
      setResponse(res);
    } catch (err) {
      console.error('Error', err);
      setResponse('Transaction failed');
    }
  };


  // Return the main div of the app, with a flex column layout, centered items, and a minimum height of 100vh
  //If showSummary is true, show the Summary component, else if showNumericField is true, show the NumericInput component, else show the Home component
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {showSummary ? (
        <Summary
          CardNumber={CardNumber}
          PIN={PIN}
          balance={balance}
          setBalance={setBalance}
          setShowSummary={setShowSummary}
          response={response}
          
        />
      ) : showNumericField ? (
        <NumericInput setShowSummary={setShowSummary} setCardNumber={setCardNumber} setPIN={setPIN} handleSendTransaction={handleSendTransaction} />
      ) : (
        <Home onButtonClick={() => setShowNumericField(true)} />
      )}
    </div>
  )
}

// Define the function for the main home component
function Home({ onButtonClick }) {
  return (
    // Display the main text, subtext, and button of the home component all with smooth animations
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <motion.h1
          className="mainText text-4xl md:text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          NCR ATM
        </motion.h1>
        <motion.h2
          className="text-2xl md:text-3xl mb-8 text-blue-500 dark:text-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Glory to the New California Republic
        </motion.h2>

        <motion.p
          className="text-xl mb-8 max-w-2xl mx-auto text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          To Start Entering Your Transaction, Click Below
        </motion.p>
      </div>
      <div className="flex justify-center  cursor-pointer">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, transitionDelay: 0.6 }}
          onClick={onButtonClick}
          style={{ backgroundImage: 'url(/assets/enterCard.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: '200px', height: '150px' }}
          whileHover={{ backgroundImage: 'url(/assets/enterCardHover.png)' }}
        >
        </motion.div>
      </div>
    </div>
  )
}

interface NumericInputProps {
  setShowSummary: (show: boolean) => void
  setCardNumber: (CardNumber: string) => void
  setPIN: (PIN: string) => void
  handleSendTransaction: () => Promise<void>
}

// Define the function for the numeric input component
function NumericInput({ setShowSummary, setCardNumber, setPIN, handleSendTransaction }: NumericInputProps) {
  // Set variables
  const [CardNumber, setLocalCardNumber] = useState("")
  const [PIN, setLocalPIN] = useState("")
  const [isEnteringPin, setIsEnteringPin] = useState(false)
  // Define the handler function for clicking keypad buttons
  const handleKeypadClick = (value: string) => {
    // If the back button is pressed, remove the last character from the input field
    if (value === "Back") {
      if (isEnteringPin) {
        if (PIN.length > 0) {
          setLocalPIN(PIN.slice(0, -1))
        } else {
          setIsEnteringPin(false)
        }
      } else {
        if (CardNumber.length > 0) {
          setLocalCardNumber(CardNumber.slice(0, -1))
        }
      }
    // If the enter button is pressed, check if the user is entering the pin or account number
    } else if (value === "Enter") {
      if (!isEnteringPin) {
        setIsEnteringPin(true)
      } else {
        // Handle bank detail submission logic here
        setCardNumber(CardNumber)
        setPIN(PIN)
        setShowSummary(true)
        // Handle bank detail submission logic here
        setCardNumber(CardNumber);
        setPIN(PIN);
        handleSendTransaction();
        setShowSummary(true);
      }
    // If any other button is pressed, add the value to the to the local pin/account number depending on state
    } else {
      if (isEnteringPin) {
        setLocalPIN((prev) => prev + value)
      } else {
        setLocalCardNumber((prev) => prev + value)
      }
    }
  }

  // Back button
  const handleGoBack = () => {
    window.location.reload()
  }

  //Return the main div of the numeric input component (our keypad) with various stylings and animations + Back Button
  return (
    <>
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
          value={isEnteringPin ? PIN : CardNumber}
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
      </motion.div>
      <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img
          src="/assets/backButton.png"
          alt="Back Icon"
          className="w-6 h-6 cursor-pointer"
          onClick={handleGoBack}
        />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-150"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleGoBack}
        >
          Go Back
        </motion.button>
      </div>
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">
        NCR
      </div>
    </>
  );
}
  
// Define the function that displays the "summary" of the account number and pin number for testing
interface SummaryProps {
  CardNumber: string;
  PIN: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  response: string;
}

function Summary({ CardNumber, PIN, balance, setBalance, setShowSummary, response }: SummaryProps) {
  const [action, setAction] = useState(null)
  const [transactionAmount, setTransactionAmount] = useState(0)

  // If the user is trying to withdraw money, show the relevant withdraw info
  if (action === "withdraw") {
    return (
      <Withdraw
        CardNumber={CardNumber}
        PIN={PIN}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={setTransactionAmount}
      />
    )
    // If the user is trying to look at their deposit, show the relevant deposit info
  } else if (action === "deposit") {
    return (
      <Deposit
        CardNumber={CardNumber}
        PIN={PIN}
        balance={balance}
        setBalance={setBalance}
        setShowSummary={() => setAction(null)}
        setTransactionAmount={setTransactionAmount}
      />
    )
  }

  // Back button
  const handleGoBack = () => {
    window.location.reload()
  }
  // Display to the user their account summary alongside the withdraw/deposit buttons, and the sign out button
  return (
    <>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-white text-2xl mb-4">Account Summary</h2>
        <p className="text-white mb-2">Account Number: {CardNumber}</p>
        <p className="text-white mb-2">Balance: £{balance}</p>
        <p className="text-white mb-2">Last Transaction: £{transactionAmount}</p>

        <button className="mt-4 m-6 px-4 py-2 bg-white text-black rounded transition-transform duration-200 hover:scale-150" onClick={() => setAction("withdraw")}>
          Withdraw
        </button>
        <button className="mt-4 m-6 px-4 py-2 bg-white text-black rounded transition-transform duration-200 hover:scale-150" onClick={() => setAction("deposit")}>
          Deposit
        </button>
      </motion.div>
      <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img
          src="/assets/backButton.png"
          alt="Back Icon"
          className="w-6 h-6 cursor-pointer"
          onClick={handleGoBack}
        />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-150"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleGoBack}
        >
          Sign Out
        </motion.button>
      </div>
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">
        NCR
      </div>
    </>
  )
}

// Define the function that handles the withdraw functionality
function Withdraw({ CardNumber, PIN, balance, setBalance, setShowSummary, setTransactionAmount }) {
  // Declare variable to handle withdrawing custom amounts
  const [customAmount, setCustomAmount] = useState("")
  // Declare a function to handle withdrawing money
  // Check to make sure amount is valid, then update the balance and show the summary
  const handleWithdraw = (amount) => {
    if (amount <= balance && amount > 0) {
      setTransactionAmount(amount)
      setBalance(balance - amount)
      setShowSummary(true)
    } else {
      alert("Invalid amount")
    }
  }

  // Back Button functionality
  const handleGoBack = () => {
    setShowSummary(true)
  }
 // Display the withdraw component with the account number, pin number, balance, and withdraw buttons
  return (
    <>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className=" text-white text-2xl mb-4">Withdraw</h2>
        <p className="text-white mb-2">Account Number: {CardNumber}</p>
        <p className="text-white mb-2">Balance: £{balance}</p>

        <h2 className=" text-white text-2xl mb-4">Withdraw how much?</h2>

        <div className="grid grid-cols-2 grid-rows-3 gap-4">
          {["1", "5", "10", "20", "50", "100"].map((amount) => (
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
        </div>
      </motion.div>
      <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img
          src="/assets/backButton.png"
          alt="Back Icon"
          className="w-6 h-6 cursor-pointer"
          onClick={handleGoBack}
        />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-150"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleGoBack}
        >
          Go Back
        </motion.button>
      </div>
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">
        NCR
      </div>
    </>
  )
}

// Define the function that handles the deposit functionality
function Deposit({ CardNumber, PIN, balance, setBalance, setShowSummary, setTransactionAmount }) {
  // Declare variable to handle withdrawing custom amounts
  const [customAmount, setCustomAmount] = useState("")
  // Declare a function to handle depositing money
  // Check to make sure amount is valid, then update the balance and show the summary
  const handleDeposit = (amount) => {
    if (amount > 0) {
      setTransactionAmount(amount)
      setBalance(balance + amount)
      setShowSummary(true)
    } else {
      alert("Invalid amount")
    }
  }
  // Back Button functionality
  const handleGoBack = () => {
    setShowSummary(true)
  }

  // Display the deposit component with the account number, pin number, balance, and withdraw buttons
  return (
    <>
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className=" text-white text-2xl mb-4">Deposit</h2>
      <p className="text-white mb-2">Account Number: {CardNumber}</p>
      <p className="text-white mb-2"> PIN Number: {PIN}</p>
      <p className="text-white mb-2">Balance: £{balance}</p>

      <h2 className=" text-white text-2xl mb-4">Deposit how much?</h2>

      <div className="grid grid-cols-2 grid-rows-3 gap-4">
        {["1", "5", "10", "20", "50", "100"].map((amount) => (
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
      </div>
    </motion.div>
    <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img
          src="/assets/backButton.png"
          alt="Back Icon"
          className="w-6 h-6 cursor-pointer"
          onClick={handleGoBack}
        />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-150"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={handleGoBack}
        >
          Go Back
        </motion.button>
      </div>
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">
        NCR
      </div>
    </>
  )
}
