// This file serves as the actual "page" of the electron ATM app, encompassing all the UI elements and functionality
// Electron runs in Node.js, so we have access to various native APIs.
// Electron also allows multiple instances of the app to run simultaneously which suffices the need of the ATM to be able to support multiple users at once.

"use client"

import { handleSendTransaction } from './transactionUtils';

declare global {
  interface Window {
    electron: {
      sendTransaction: (transactionData: {
        atmID: string
        TnxTime: string
        TnxID: string
        TnxKind: number
        TnxAmount: number
        CardNumber: number
        PIN: number
      }) => Promise<string>
    }
  }
}

// Import the global CSS styles that incorporate tailwind styles
import "./globals.css";
import Link from "next/link";
// Import react, usestate, motion for managing functional components and animations
import React, { useState, useEffect, createContext, useContext } from "react";
import { motion } from "framer-motion";
// Import the translations
import translations from "./translations.json";
// Set a context for translations to use across the app
interface TranslationContextType {
  t: typeof translations["en"];
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

const TranslationContext = createContext<TranslationContextType>({
  t: translations["en"],
  language: "en",
  setLanguage: () => {},
});

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState(() => {
    // Retrieve the language from local storage or default to 'en'
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    // Store the selected language in local storage
    localStorage.setItem("language", language);
  }, [language]);

  const t = translations[language];

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);

// Defines the main functional component of the app
export default function App() {

 

  // Define variable for the current language
  const {t, language, setLanguage} = useTranslation();

   // Define variable for whether login buttons should be shown
  const [showLoginButtons, setShowLoginButtons] = useState(false)
  // Define variable for whether summary should be shown
  const [showSummary, setShowSummary] = useState(false)
  // Define variables for account number and pin number
  const [CardNumber, setCardNumber] = useState("")
  const [PIN, setPIN] = useState("")
  const [balance, setBalance] = useState(1000) // Initial balance
  const [response, setResponse] = useState("");

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  // Return the main div of the app, with a flex column layout, centered items, and a minimum height of 100vh
  // If showSummary is true, show the Summary component, else if showLoginButtons is true, show the LoginButtons component, else show the Home component
  return (
    <TranslationProvider>
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {showSummary ? (
        <Summary
          CardNumber={CardNumber}
          PIN={PIN}
          balance={balance}
          setBalance={setBalance}
          setShowSummary={setShowSummary}
          response={response}
          setResponse={setResponse}
        />
      ) : showLoginButtons ? (
        <LoginButtons
          setCardNumber={setCardNumber}
          setPIN={setPIN}
          setShowSummary={setShowSummary}
        />
      ) : (
        <Home onButtonClick={() => setShowLoginButtons(true)} />
      )}
    </div>
  </TranslationProvider>
  )
}

// Define the function for the main home component
function Home({ onButtonClick }) {
  const { t, language, setLanguage } = useTranslation();
  return (
    // Display the main text, subtext, and button of the home component all with smooth animations
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <motion.h1
          className="mainText text-4xl md:text-6xl font-bold mb-4 hover:text-blue-500 hover:dark:text-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.title}
        </motion.h1>
        <motion.h2
          className="text-2xl md:text-3xl mb-8 text-blue-500 dark:text-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t.subtitle}
        </motion.h2>

        <motion.p
          className="text-xl mb-8 max-w-2xl mx-auto text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {t.description}
        </motion.p>
      </div>
      <div className="flex justify-center cursor-pointer">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, transitionDelay: 0.6 }}
          onClick={onButtonClick}

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
      </div>
      <div className="fixed bottom-0 right-0 mb-4 mr-4">
      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-4 py-2 bg-white text-black rounded">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
          <option value="ru">Русский</option>
          <option value="ar">العربية</option>
        </select>
      </div>
    </div>
  )
}

interface LoginButtonsProps {
  setCardNumber: (CardNumber: string) => void
  setPIN: (PIN: string) => void
  setShowSummary: (show: boolean) => void
}


// Define the function for the login buttons component
function LoginButtons({ setCardNumber, setPIN, setShowSummary }: LoginButtonsProps) {
  const accounts = [
    { CardNumber: "4242424242424242", PIN: "1234" },
    { CardNumber: "987654321", PIN: "4321" },
    { CardNumber: "456789123", PIN: "5678" },
    { CardNumber: "789123456", PIN: "8765" },
  ]

  const handleLogin = (account) => {
    setCardNumber(account.CardNumber)
    setPIN(account.PIN)
    setShowSummary(true)

  }

  const buttonColors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"]

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h2 className="text-white text-2xl mb-4 font-extrabold">Select Your Account</h2>
      <div className="flex space-x-4">
        {accounts.map((account, index) => (
          <div key={index} className="flex flex-col items-center justify-center cursor-pointer" onClick={() => handleLogin(account)}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, transitionDelay: 0.6 }}
              style={{
                backgroundImage: "url(/assets/enterCard.png)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "200px",
                height: "150px",
                border: `4px solid ${buttonColors[index].replace('bg-', '')}`
              }}
              whileHover={{ backgroundImage: "url(/assets/enterCardHover.png)" }}
              whileTap={{ backgroundImage: "url(/assets/enterCardOnClick.png)" }}
            ></motion.div>
            <span className="text-white mt-2">Account {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Define the function that displays the "summary" of the account number and pin number for testing
interface SummaryProps {
  CardNumber: string
  PIN: string
  balance: number
  setBalance: React.Dispatch<React.SetStateAction<number>>
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>
  response: string
  setResponse: React.Dispatch<React.SetStateAction<string>>
}

function Summary({ CardNumber, PIN, balance, setBalance, setShowSummary, response, setResponse }) {
  const [action, setAction] = useState(null)
  const { t } = useTranslation();
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [transactionKind, setTransactionKind] = useState(null)

  // If the user is trying to withdraw money, show the relevant withdraw info
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
    // If the user is trying to look at their deposit, show the relevant deposit info
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
        
        <h2 className="text-white text-2xl mb-4 font-extrabold">{t.accountSummary}</h2>
        <div className="flex justify-between text-white mb-2">
          <span className="font-bold">{t.accountNumber}:</span>
          <span>{CardNumber}</span>
        </div>
        <div className="flex justify-between text-white mb-2">
          <span className="font-bold">{t.balance}:</span>
          <span>£{balance}</span>
        </div>
        <div className="flex justify-between text-white mb-2">
        <span className="font-bold">{t.lastTransaction}:</span>
        {transactionAmount > 0 && (
          <span>
            {transactionKind === "withdraw" ? "-" : "+"}£{transactionAmount}
          </span>
        )}
        </div>
        <div className="flex justify-between text-white mb-2">
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
      </motion.div>
      <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img src="/assets/backButton.png" alt="Back Icon" className="w-6 h-6 cursor-pointer" onClick={handleGoBack} />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-125"
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
  )
}

function Withdraw({ CardNumber, PIN, balance, setBalance, setShowSummary, setTransactionAmount, setResponse }) {
  // Declare variable to handle withdrawing custom amounts
  const [customAmount, setCustomAmount] = useState("")
  const [showPopup, setShowPopup] = useState(false);
  const { t } = useTranslation();
  // Declare a function to handle withdrawing money
  // Check to make sure amount is valid, then update the balance and show the summary
  const handleWithdraw = (amount) => {
    if (amount <= balance && amount > 0) {
      setTransactionAmount(amount)
      setBalance(balance - amount)
      handleSendTransaction(1, amount, CardNumber, PIN, setResponse) // 1 for withdrawal
      setShowSummary(true)
    } else {
      setShowPopup(true);
    }
  }

  // Back Button functionality
  const handleGoBack = () => {
    setShowSummary(true)
  }
  const invalidTransaction = () => {
    setShowPopup(false);
    window.location.reload();
  };
  // Display the withdraw component with the account number, pin number, balance, and withdraw buttons
  return (
    <>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className=" text-white text-2xl mb-4 font-extrabold">{t.withdrawal}</h2>
        <div className="flex justify-between text-white mb-2">
          <span className="font-bold">{t.accountNumber}:</span>
          <span>{CardNumber}</span>
        </div>
        <div className="flex justify-between text-white mb-10">
          <span className="font-bold">{t.balance}:</span>
          <span>£{balance}</span>
        </div>

        <h2 className=" text-white text-2xl mb-4">{t.withdrawAmount}</h2>

        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          {["1", "5", "10", "20", "50", "100"].map((amount) => (
            <button
              key={amount}
              className="mt-2 px-4 py-2 m-2 bg-white text-black rounded-full hover:scale-125"
              onClick={() => handleWithdraw(Number.parseInt(amount))}
            >
              £{amount}
            </button>
          ))}
        </div>
        <div className="grid" >
        <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
            placeholder="Custom Amount"
            min="1"
          />
          <button
            className="mt-4 m-2 px-4 py-2 bg-white text-black rounded hover:scale-125"
            onClick={() => handleWithdraw(Number.parseInt(customAmount))}
          >
            {t.withdrawCustomAmount}
          </button>
        </div>
        {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded font-bold">
            <p>{t.invalidTransaction}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded font-bold hover:scale-125"
              onClick={invalidTransaction}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
      </motion.div>
      <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img src="/assets/backButton.png" alt="Back Icon" className="w-6 h-6 cursor-pointer" onClick={handleGoBack} />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-125"
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
  )
}

function Deposit({ CardNumber, PIN, balance, setBalance, setShowSummary, setTransactionAmount, setResponse }) {
  // Declare variable to handle withdrawing custom amounts
  const [customAmount, setCustomAmount] = useState("")
  const [showPopup, setShowPopup] = useState(false);
  const { t } = useTranslation();
  // Declare a function to handle depositing money
  // Check to make sure amount is valid, then update the balance and show the summary
  const handleDeposit = (amount) => {
    if (amount > 0) {
      setTransactionAmount(amount)
      setBalance(balance + amount)
      handleSendTransaction(2, amount, CardNumber, PIN, setResponse) // 2 for deposit
      setShowSummary(true)
    } else {
      setShowPopup(true);
    }
  }
  // Back Button functionality
  const handleGoBack = () => {
    setShowSummary(true)
  }
  const invalidTransaction = () => {
    setShowPopup(false);
    window.location.reload();
  };

  // Display the deposit component with the account number, pin number, balance, and withdraw buttons
  return (
    <>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className=" text-white text-2xl mb-4 font-extrabold">{t.deposit}</h2>
        <div className="flex justify-between text-white mb-2">
          <span className="font-bold">{t.accountNumber}:</span>
          <span>{CardNumber}</span>
        </div>
        <div className="flex justify-between text-white mb-10">
          <span className="font-bold">{t.balance}:</span>
          <span>£{balance}</span>
        </div>


        <h2 className=" text-white text-2xl mb-4">{t.depositAmount}</h2>


        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          {["1", "5", "10", "20", "50", "100"].map((amount) => (
            <button
              key={amount}
              className="mt-2 px-4 py-2 m-2 bg-white text-black rounded-full hover:scale-125"
              onClick={() => handleDeposit(Number.parseInt(amount))}
            >
              £{amount}
            </button>
          ))}
        </div>
        <div className="grid" >
        <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="mt-4 m-2 px-4 py-2 bg-white text-black rounded"
            placeholder="Custom Amount"
            min="1"
          />
          <button
            className="mt-4 m-2 px-4 py-2 bg-white text-black rounded hover:scale-125"
            onClick={() => handleDeposit(Number.parseInt(customAmount))}
          >
            {t.depositCustomAmount}
          </button>
        </div>
        {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <p>{t.invalidTransaction}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={invalidTransaction}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}  
      </motion.div>
      <div className="fixed top-0 left-0 mt-4 ml-4 flex items-center">
        <img src="/assets/backButton.png" alt="Back Icon" className="w-6 h-6 cursor-pointer" onClick={handleGoBack} />

        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform duration-200 hover:scale-125"
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
  )
}