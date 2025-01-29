export const handleSendTransaction = async (
  transactionKind: number,
  amount = 0,
  CardNumber: string,
  PIN: string,
  setResponse: (response: string) => void,
) => {
  console.log("Initiating transaction...")

  const atmID = "ATM123"
  const TnxTime = new Date().toISOString()
  const TnxID = `${atmID}-${Date.now()}`

  // Convert strings to integers
  const cardNumberInt = Number.parseInt(CardNumber, 10)
  const pinInt = Number.parseInt(PIN, 10)

  // Validate numbers
  if (isNaN(cardNumberInt) || isNaN(pinInt)) {
    setResponse("Invalid card number or PIN")
    return
  }

  const transactionData = {
    atmID,
    TnxTime,
    TnxID,
    TnxKind: transactionKind,
    TnxAmount: amount,
    CardNumber: cardNumberInt,
    PIN: pinInt,
  }

  try {
    console.log("Sending transaction data:", transactionData)
    const res = await window.electron.sendTransaction(transactionData)
    console.log("Received response:", res)
    const parsedResponse = JSON.parse(res)
    setResponse(parsedResponse.msg)
  } catch (err) {
    console.error("Error in handleSendTransaction:", err)
    setResponse("Transaction failed")
  }
}

