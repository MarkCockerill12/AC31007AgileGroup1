// This file serves as the actual "page" of the electron ATM app, encompassing all the UI elements and functionality
// Electron runs in Node.js, so we have access to various native APIs.
// Electron also allows multiple instances of the app to run simultaneously which suffices the need of the ATM to be able to support multiple users at once.
// 

'use client'

// Import the global CSS styles that incorporate tailwind styles
import './globals.css';
import Link from 'next/link'
// Import react, usestate, motion for managing functional components and animations
import React, { useState } from 'react'
import { motion } from 'framer-motion'
// Import various icons from lucide-react for the UI
import { Code, Palette, Gamepad, Lightbulb } from 'lucide-react'

// Defines the main functional component of the app
export default function App() {
  // Define variable for whether numeric input field should be shown
  const [showNumericField, setShowNumericField] = useState(false);
  // Define variable for whether summary should be shown
  const [showSummary, setShowSummary] = useState(false);
  // Define variables for account number and pin number
  const [accountNumber, setAccountNumber] = useState("");
  const [pinNumber, setPinNumber] = useState("");

  // Return the main div of the app, with a flex column layout, centered items, and a minimum height of 100vh
  //If showSummary is true, show the Summary component, else if showNumericField is true, show the NumericInput component, else show the Home component
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

// Define the function for the main home component
function Home({ onButtonClick }) {
  return (
    // Display the main text, subtext, and button of the home component all with smooth animations
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

// Define the function for the numeric input component
function NumericInput({ setShowSummary, setAccountNumber, setPinNumber }) {
  // Set variables
  const [accountNumber, setLocalAccountNumber] = useState("");
  const [pinNumber, setLocalPinNumber] = useState("");
  const [isEnteringPin, setIsEnteringPin] = useState(false);

  // Define the handler function for clicking keypad buttons
  const handleKeypadClick = (value) => {
    // If the back button is pressed, remove the last character from the input field
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
    // If the enter button is pressed, check if the user is entering the pin or account number
    } else if (value === 'Enter') {
      if (!isEnteringPin) {
        setIsEnteringPin(true);
      } else {
        // Handle bank detail submission logic here
        setAccountNumber(accountNumber);
        setPinNumber(pinNumber);
        setShowSummary(true);
      }
    // If any other button is pressed, add the value to the to the local pin/account number depending on state
    } else {
      if (isEnteringPin) {
        setLocalPinNumber((prev) => prev + value);
      } else {
        setLocalAccountNumber((prev) => prev + value);
      }
    }
  };

  //Return the main div of the numeric input component (our keypad) with various stylings and animations
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
// Define the function that displays the "summary" of the account number and pin number for testing
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