"use client"

import { useState, useEffect } from "react"
import { Home } from "./components/Home"
import { LoginButtons } from "./components/LoginButtons"
import { Summary } from "./components/Summary"
import { Balance } from "./components/Balance"
import { TranslationProvider } from "./contexts/TranslationContext"
import { handleBalanceRequest } from "./transactionUtils"

export default function App() {
  const [showLoginButtons, setShowLoginButtons] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [CardNumber, setCardNumber] = useState("")
  const [PIN, setPIN] = useState("")
  const [balance, setBalance] = useState(0)
  const [response, setResponse] = useState("")
  const [showBalance, setShowBalance] = useState(false)

  useEffect(() => {
    if (CardNumber) {
      handleBalanceRequest(parseInt(CardNumber), setBalance, setResponse)
    }
  }, [CardNumber])

  return (
    <TranslationProvider>
      <div className="flex flex-col items-center justify-center min-h-screen ">
        <div className="w-full max-w-4xl mx-auto px-4">
          {showSummary ? (
            <Summary
              CardNumber={CardNumber}
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
            />
          ) : showBalance ? (
            <Balance balance={balance} setShowSummary={setShowSummary} CardNumber={parseInt(CardNumber)} />
          ) : (
            <Home onButtonClick={() => setShowLoginButtons(true)} />
          )}
        </div>
      </div>
    </TranslationProvider>
  )
}