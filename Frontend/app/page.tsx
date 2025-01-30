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
  const [CardNumber, setCardNumber] = useState("")
  const [PIN, setPIN] = useState("")
  const [balance, setBalance] = useState(1000)
  const [response, setResponse] = useState("")
  const [showBalance, setShowBalance] = useState(false)

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
            setShowBalance={setShowBalance}
          />
        ) : showLoginButtons ? (
          <LoginButtons setCardNumber={setCardNumber} setPIN={setPIN} setShowSummary={setShowSummary} />
        ) : showBalance ? (
          <Balance balance={balance} setShowSummary={setShowSummary} CardNumber={CardNumber} />
        ) : (
          <Home onButtonClick={() => setShowLoginButtons(true)} />
        )}
      </div>
    </TranslationProvider>
  )
}