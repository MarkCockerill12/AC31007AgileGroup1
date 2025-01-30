import json
import mysql.connector
import pymysql
import os
from datetime import datetime
import socket
from decimal import Decimal
import ssl

# Config
tcp_host = "0.0.0.0"
tcp_port = 31007
buffer_size = 1024
log_file_name = "logs/logFile.txt"

# DB Config
db_host = "localhost"
user = "user"
password = "AC31007"


mydb = pymysql.connect(
    host="localhost",
    user="user",
    password="AC31007",
    database="atm_database",
    ssl_disabled=True,
)


# checks to see if the card and pin passed in with the json is correct to the data bases entity
def CorrectPIN(PAN, PIN):
    mycursor = mydb.cursor()
    mycursor.execute("call PAN_find_PIN(%s)", (PAN,))
    selectGET = mycursor.fetchall()
    print(selectGET[0][0], " ", PIN)

    if selectGET[0][0] == PIN:
        return True
    else:
        return False


# checks to see if the card has enough money to make a withdraw
def CorrectFunds(PAN, Amount):
    mycursor = mydb.cursor()
    mycursor.execute("call getBalance(%s)", (PAN,))
    selectGET = mycursor.fetchall()
    balance = selectGET[0][0]

    if Amount < balance:
        return True
    else:
        return False


# checks to see if the card is blocked
def IsCardBlocked(PAN):
    mycursor = mydb.cursor()
    mycursor.execute("call CheckIfAccountBlocked(%s)", (PAN,))
    selectGET = mycursor.fetchall()

    if selectGET[0][0] == 1:
        return True
    else:
        return False


# checks to see if the card even exists
def DoesCardExist(PAN):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT PAN FROM cardDetails WHERE PAN = %s", (PAN,))
    selectGET = mycursor.fetchall()

    if selectGET[0][0] != PAN:
        False
    else:
        True


# checks to see if the card has infront of behind its expiry date
def HasCardExpired(PAN, time):
    mycursor = mydb.cursor()
    mycursor.execute("call GetCardExpiryByPAN(%s)", (PAN,))
    selectGET = mycursor.fetchall()

    # Assuming selectGET[0][0] is a datetime.date or datetime type from DB
    card_expiry_date = selectGET[0][0]  # from the DB
    print(f"Card expiry from DB: {card_expiry_date}")
    print(f"Time passed to the function: {time}")

    # are the variables in the right format
    if isinstance(time, str):
        time_datetime = datetime.strptime(
            time, "%Y-%m-%d"
        )  # Adjust to match your time format
    else:
        time_datetime = (
            time  # Assuming time is already a datetime.date or datetime object
        )

    if card_expiry_date < time_datetime:
        return True
    else:
        return False


def makeWithdrawl(PAN, amount):
    mycursor = mydb.cursor()
    mycursor.execute("call getBalance(%s)", (PAN,))
    selectGET = mycursor.fetchall()

    newBalance = selectGET[0][0] - amount

    mycursor = mydb.cursor()
    mycursor.execute("call update_Balance(%s, %s)", (PAN, newBalance))
    mydb.commit()


# this checks if the card is valid in 3 ways, login pin and if the card is blocked or expired
def ValidCard(PAN, PIN, Time):
    CheckPIN = CorrectPIN(PAN, PIN)
    print(CheckPIN)

    if CheckPIN == True:
        print("pin is valid")
    else:
        print("pin is not valid")

    # checking if the card is blocked or not
    checkBlocked = IsCardBlocked(PAN)
    if checkBlocked == True:
        print("your card is blocked")
    else:
        print("you card is not blocked ;)")

    # checking if the card is expired or not
    checkEX = HasCardExpired(PAN, Time)
    if checkEX == False:
        print("your card is in date")
    else:
        print("your card is not in date")

    if CheckPIN is True and checkBlocked is False and checkEX is False:
        return True
    elif CheckPIN is False:
        return 2
    elif checkBlocked is True:
        return 3
    elif checkEX is True:
        return 5


def handle_switch_connection(incoming_socket, incoming_address):
    request = None
    try:
        data = incoming_socket.recv(buffer_size).decode("utf-8")
        # processing jason file
        try:
            request = json.loads(data)
            with open(log_file_name, "a", encoding="utf-8") as log_file:
                log_file.write(str(request) + "\n")
            print(request)
        # if jason is dodgy excemption
        except json.JSONDecodeError:
            response = {"TnxID": "null", "RespType": 6, "msg": "JSON format error"}
            incoming_socket.send(json.dumps(response).encode("utf-8"))
            with open(log_file_name, "a", encoding="utf-8") as log_file:
                log_file.write(str(response) + "\n")
            return

        # HERE maybe take this out? dont know the use yet
        cool = '{"TnxID": "12345", "TnxTime": "2025-01-28", "TnxKind": "withdrawal", "TnxAmount": 100, "CardNumber": "123456789", "PIN": "1234"}'

        # converts data from json to correct formats to be used
        ID = request.get("TnxID").strip()
        Time = request.get("TnxTime")
        Time = datetime.strptime(Time, "%Y-%m-%d %H:%M:%S.%f")
        Time = Time.date()
        Kind = int(request.get("TnxKind"))
        Amount = Decimal(request.get("TnxAmount"))
        PAN = int(request.get("CardNumber"))
        PIN = int(request.get("PIN"))

        ##displaying data for debugging
        print("\n")
        print("\n")
        print(ID)
        print(Time)
        print(Kind)
        print(Amount)
        print(PAN)
        print(PIN)
        print("\n")
        print("\n")

        respType = 0
        respMessage = ""

        # from here to next comment
        # this code verifys the card and will alwase happen
        isCardValid = ValidCard(PAN, PIN, Time)

        if isCardValid is True:
            respMessage = "Login Successful"
            respType = 0
        else:
            respMessage = "Login Unsuccessful"
            respType = isCardValid

        # make a withdrawl from the account
        if Kind == 1 and isCardValid is True:
            # checking if the card has enough money for the withdrawl
            checkBalance = CorrectFunds(PAN, Amount)
            if checkBalance is False:
                print("you are withdrawing to much")
                respMessage = "Withdraw Exceeds Balance"
                respType = 1
            else:
                print("you can withdraw this")
                makeWithdrawl(PAN, Amount)
                respMessage = "Withdraw Successful"
                respType = 0

        # get balance to be displayed
        if Kind == 3 and isCardValid is True:
            mycursor = mydb.cursor()
            mycursor.execute("call getBalance(%s)", (PAN,))
            selectGET = mycursor.fetchall()

            respMessage = "Your Current Balance is " + str(selectGET[0][0])
            respType = 0

        # deposit cash choice
        if Kind == 2 and isCardValid is True:
            Increase = 0 - Amount
            makeWithdrawl(PAN, Increase)

            mycursor = mydb.cursor()
            mycursor.execute("call getBalance(%s)", (PAN,))
            selectGET = mycursor.fetchall()

            respMessage = "Your Balance is Now " + str(selectGET[0][0])
            respType = 0

        mycursor = mydb.cursor()
        mycursor.execute(" SELECT * FROM userAccount")
        selectGET = mycursor.fetchall()

        for y in selectGET:
            print(y)

        response = {
            "TnxID": request.get(
                "TnxID",
            ),
            "RespType": respType,
            "msg": respMessage,
        }
        print(response)
        incoming_socket.send((json.dumps(response) + "\n").encode("utf-8"))
        with open(log_file_name, "a", encoding="utf-8") as log_file:
            log_file.write(str(response) + "\n")
    finally:
        incoming_socket.close()


def check_logfile():
    print("Current working directory:", os.getcwd())
    try:
        log_file = open(log_file_name, "r", encoding="utf-8")
        print("Log file present")
    except:
        log_file = open(log_file_name, "w", encoding="utf-8")
        print("Log file not present - creating")
    finally:
        log_file.close()


def start_server():
    mycursor = mydb.cursor()
    mycursor.execute(" SELECT * FROM userAccount")
    selectGET = mycursor.fetchall()

    for y in selectGET:
        print(y)

    check_logfile()
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile="server.crt", keyfile="server.key")

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((tcp_host, tcp_port))
    server_socket.listen(5)
    try:
        while True:
            new_socket, incoming_address = server_socket.accept()
            secure_socket = context.wrap_socket(new_socket, server_side=True)
            handle_switch_connection(secure_socket, incoming_address)
    except KeyboardInterrupt:
        print("")
    finally:
        server_socket.close()


if __name__ == "__main__":
    start_server()
