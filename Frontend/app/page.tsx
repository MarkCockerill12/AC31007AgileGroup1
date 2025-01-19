'use client'

import './globals.css';
import Link from 'next/link'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Palette, Gamepad, Lightbulb } from 'lucide-react'

export default function App() {
  const [showNumericField, setShowNumericField] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [pinNumber, setPinNumber] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {showSummary ? (
        <Summary accountNumber={accountNumber} pinNumber={pinNumber} />
      ) : showNumericField ? (
        <NumericInput 
          setShowSummary={setShowSummary}
          setAccountNumber={setAccountNumber}
          setPinNumber={setPinNumber}
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
        Hello Dingus
      </motion.h1>
      <motion.h2 
        className="text-center text-2xl md:text-3xl mb-8 text-blue-500 dark:text-blue-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Let's get started
      </motion.h2>
      
      <motion.p 
        className="text-center text-xl mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        click the button or im going to eat your cookies
      </motion.p>

      <motion.button
        className="text-center text-xl mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        onClick={onButtonClick}
      >
        lookie lookie
      </motion.button>
    </div>
  );
}

function NumericInput({ setShowSummary, setAccountNumber, setPinNumber }) {
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
        setShowSummary(true);
      }
    } else {
      if (isEnteringPin) {
        setLocalPinNumber((prev) => prev + value);
      } else {
        setLocalAccountNumber((prev) => prev + value);
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label htmlFor="numeric-field" className="text-white mb-2">
        {isEnteringPin ? "Enter your PIN" : "Enter your Account Number"}
      </label>
      <input 
        type="text"
        value={isEnteringPin ? pinNumber : accountNumber}
        readOnly
        className="border p-2 mb-4 border-gray-300"
        id="numeric-field"
      />
      <div className="grid grid-cols-3 gap-2 mt-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Back', '0', 'Enter'].map((button) => (
          <button
            key={button}
            className="text-white font-bold p-2 text-center"
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            onClick={() => handleKeypadClick(button)}
          >
            {button}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Summary({ accountNumber, pinNumber }) {
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
    </motion.div>
  );
}