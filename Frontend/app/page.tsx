'use client'
declare global {
  interface Window {
    electron: {
      sendTransaction: (transactionData: { accountNumber: string; pinNumber: string }) => Promise<string>;
    };
  }
}

import './globals.css';
import Link from 'next/link'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ipcRenderer, IpcRenderer } from 'electron'
import { Code, Palette, Gamepad, Lightbulb } from 'lucide-react'



export default function App() {
  const [showNumericField, setShowNumericField] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [pinNumber, setPinNumber] = useState("");
  const [response, setResponse] = useState("");


  
   const handleSendTransaction = async () => {
     const transactionData = { accountNumber, pinNumber };
    try {
      console.log(transactionData);
       const res = await window.electron.sendTransaction(transactionData);
       setResponse(res);
     } catch (err) {
       console.error('Error', err);
     }
   };


   return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {showSummary ? (
        <Summary accountNumber={accountNumber} pinNumber={pinNumber} response={response} />
      ) : showNumericField ? (
        <NumericInput 
          setShowSummary={setShowSummary}
          setAccountNumber={setAccountNumber}
          setPinNumber={setPinNumber}
          handleSendTransaction={handleSendTransaction}
        />
      ) : (
        <Home onButtonClick={() => setShowNumericField(true)} />
      )}
    </div>
  );
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
        className="text-center text-xl mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        onClick={onButtonClick}
      >
        Enter PIN
      </motion.button>
    </div>
  );
}




function NumericInput({ setShowSummary, setAccountNumber, setPinNumber, handleSendTransaction }) {
  const [accountNumber, setLocalAccountNumber] = useState("");
  const [pinNumber, setLocalPinNumber] = useState("");
  const [isEnteringPin, setIsEnteringPin] = useState(false);

  const handleKeypadClick = (value) => {
    if (value === 'Back') {
      if (isEnteringPin) {
        if (pinNumber.length > 0) {
          setLocalPinNumber(pinNumber.slice(0, -1));
        } else {
          setIsEnteringPin(false);
        }
      } else {
        if (accountNumber.length > 0) {
          setLocalAccountNumber(accountNumber.slice(0, -1));
        }
      }
    } else if (value === 'Enter') {
      if (!isEnteringPin) {
        setIsEnteringPin(true);
      } else {
        // Handle PIN submission logic here
        setAccountNumber(accountNumber);
        setPinNumber(pinNumber);
        handleSendTransaction();
      }
    } else {
      if (isEnteringPin) {
        setLocalPinNumber((prev) => prev + value);
      } else {
        setLocalAccountNumber((prev) => prev + value);
      }
    }
  };

  const handleGoBack = () => {
    setShowSummary(false);
    setAccountNumber("");
    setPinNumber("");
    window.location.reload();
  };

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
      />
      <div className="grid grid-cols-3 gap-2 mt-2 bg-zinc-300 rounded-md ">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Back', '0', 'Enter'].map((button) => (
          <button
            key={button}
            className="text-black font-bold p-2 text-center hover:bg-gray-700"
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            onClick={() => handleKeypadClick(button)}
          >
            {button}
          </button>
        ))}
      </div>
      <button 
        className="mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded"
        onClick={handleGoBack}
      >
        Go Back
      </button>
    </motion.div>
  );
}

function Summary({ accountNumber, pinNumber, response }) {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl mb-4">Summary</h2>
      <p className="mb-2">Account Number: {accountNumber}</p>
      <p>PIN Number: {pinNumber}</p>
      <p>Response: {response}</p>
    </motion.div>
  );
}
