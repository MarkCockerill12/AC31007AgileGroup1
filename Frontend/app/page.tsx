"use client"

import { useState } from "react"
import { Home } from "./components/Home"
import { LoginButtons } from "./components/LoginButtons"
import { Summary } from "./components/Summary"
import { Balance } from "./components/Balance"
import { TranslationProvider } from "./contexts/TranslationContext"

export default function App() {
  const [showLoginButtons, setShowLoginButtons] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [cardNumber, setCardNumber] = useState(0)
  const [PIN, setPIN] = useState("")
  const [balance, setBalance] = useState(0)
  const [response, setResponse] = useState("")
  const [showBalance, setShowBalance] = useState(false)

  return (
    <TranslationProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-ncr-blue-900 to-ncr-blue-500">
        <div className="w-full max-w-4xl mx-auto px-4">
          {showSummary ? (
            <Summary
              CardNumber={cardNumber.toString()}
              PIN={PIN}
              balance={balance}
              setBalance={setBalance}
              setShowSummary={setShowSummary}
              response={response}
              setResponse={setResponse}
              setShowBalance={setShowBalance}
            />
          ) : showLoginButtons ? (
            <LoginButtons
              setCardNumber={setCardNumber}
              setPIN={setPIN}
              setShowSummary={setShowSummary}
              setResponse={setResponse}
              setBalance={setBalance} // Pass balance setter here
            />
          ) : showBalance ? (
            <Balance 
              balance={balance} 
              setShowSummary={setShowSummary} 
              CardNumber={cardNumber} 
              PIN={parseInt(PIN)}
              setBalance={setBalance}
              setResponse={setResponse}
            />
          ) : (
            <Home onButtonClick={() => setShowLoginButtons(true)} />
          )}
        </div>
      </div>
    </TranslationProvider>
  )
}