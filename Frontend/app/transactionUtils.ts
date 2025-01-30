import { useState } from "react"

interface ErrorResponse {
  atmID: string
  TnxID: string
  RespType: number
  msg: string
}

export const handleSendTransaction = async (
  transactionKind: number,
  amount = 0,
  CardNumber: number,
  PIN: number,
  setResponse: (response: string) => void,
) => {
  console.log("Initiating transaction...")

  const atmID = "ATM-123"
  const TnxTime = new Date().toISOString()
  const TnxID = `${atmID}-${Date.now()}`

  const transactionData = {
    TnxID,
    TnxTime,
    TnxKind: transactionKind,
    TnxAmount: amount,
    CardNumber,
    PIN,
  }

  try {
    console.log("Sending transaction data:", transactionData)
    const res = await window.electron.sendTransaction(transactionData)
    console.log("Received response:", res)
    const parsedResponse: ErrorResponse = JSON.parse(res)

    let errorMessage = parsedResponse.msg
    switch (parsedResponse.RespType) {
      case 0:
        errorMessage = "Transaction approved: " + errorMessage
        break
      case 1:
        errorMessage = "Insufficient funds: " + errorMessage
        break
      case 2:
        errorMessage = "Incorrect PIN: " + errorMessage
        break
      case 3:
        errorMessage = "Card blocked: " + errorMessage
        break
      case 4:
        errorMessage = "Card doesn't exist: " + errorMessage
        break
      case 5:
        errorMessage = "Card is expired: " + errorMessage
        break
      case 6:
        errorMessage = "General/system error: " + errorMessage
        break
    }

    setResponse(errorMessage)
    return parsedResponse
  } catch (err) {
    console.error("Error in handleSendTransaction:", err)
    setResponse("Transaction failed: " + err.message)
    return { RespType: 6, msg: "Transaction failed: " + err.message }
  }
}

export const handleBalanceRequest = async (
  CardNumber: number,
  setBalance: (balance: number) => void,
  setResponse: (response: string) => void,
) => {
  console.log("Requesting balance...")

  const atmID = "ATM-123"
  const TnxTime = new Date().toISOString()
  const TnxID = `${atmID}-${Date.now()}`

  const transactionData = {
    TnxID,
    TnxTime,
    TnxKind: 0,
    TnxAmount: 0,
    CardNumber,
    PIN: 0,
  }

  try {
    console.log("Sending balance request data:", transactionData)
    const res = await window.electron.sendTransaction(transactionData)
    console.log("Received response:", res)
    const parsedResponse: ErrorResponse = JSON.parse(res)

    if (parsedResponse.RespType === 0) {
      setBalance(parseFloat(parsedResponse.msg))
    } else {
      setResponse(parsedResponse.msg)
    }
  } catch (err) {
    console.error("Error in handleBalanceRequest:", err)
    setResponse("Balance request failed: " + err.message)
  }
}

export const useErrorPopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")

  const showErrorPopup = (message: string) => {
    setPopupMessage(message)
    setShowPopup(true)
  }

  const closeErrorPopup = () => {
    setShowPopup(false)
  }

  return { showPopup, popupMessage, showErrorPopup, closeErrorPopup }
}