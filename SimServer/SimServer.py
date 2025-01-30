import json
import mysql.connector
import pymysql
import os
from datetime import datetime
import socket
from decimal import Decimal
 
#Config
tcp_host = "0.0.0.0"
tcp_port = 31007
buffer_size = 1024
log_file_name = "/var/www/html/logFile.txt"
 
#DB Config
db_host = "localhost"
user = "user"
password = "AC31007"
 
 
mydb = pymysql.connect(
    host = 'localhost',
    user = 'user',
    password = 'AC31007',
    database = 'atm_database',
    ssl_disabled = True
)
 
#checks to see if the card and pin passed in with the json is correct to the data bases entity
def CorrectPIN(PAN, PIN):
    try:
        mycursor = mydb.cursor()
        mycursor.execute("call PAN_find_PIN(%s)", (PAN,))
        selectGET = mycursor.fetchall()
       
        if not selectGET:
            return False
       
        if selectGET[0][0] == PIN:
            return True
       
        else:
            return False
       
    except Exception as e:
        print(f"error has occured in CorrectPIN")
   
 
#checks to see if the card has enough money to make a withdraw
def CorrectFunds(PAN, Amount):
    mycursor = mydb.cursor()
    mycursor.execute("call getBalance(%s)", (PAN,))
    selectGET = mycursor.fetchall()
    balance = selectGET[0][0]
 
    if Amount < balance:
        return True
    else:
        return False
 
#checks to see if the card is blocked
def IsCardBlocked(PAN):
    try:
        mycursor = mydb.cursor()
        mycursor.execute("call CheckIfAccountBlocked(%s)", (PAN,))
        selectGET = mycursor.fetchall()
 
        # Check if the result set is empty
        if not selectGET:
            print(f"No account status found for PAN: {PAN}")
            return False
 
        if selectGET[0][0] == 1:
            return True
        else:
            return False
 
    except Exception as e:
        print(f"An error occurred in isCardBlocked: {e}")
        return False
 
#checks to see if the card even exists
def DoesCardExist(PAN):
    mycursor = mydb.cursor()
    mycursor.execute("SELECT PAN FROM cardDetails WHERE PAN = %s", (PAN,))
    selectGET = mycursor.fetchall()
 
    if selectGET[0][0] != PAN:
        False
    else:
        True
 
 
#checks to see if the card has infront of behind its expiry date
def HasCardExpired(PAN, time):
    try:
        mycursor = mydb.cursor()
        mycursor.execute("call GetCardExpiryByPAN(%s)", (PAN,))
        selectGET = mycursor.fetchall()
 
        # Check if the result set is empty
        if not selectGET:
            print(f"No expiry date found for PAN: {PAN}")
            return False
 
        card_expiry_date = selectGET[0][0]
 
        # Assuming 'time' is a string or datetime.date, so handle conversion correctly
        if isinstance(time, str):
            time_datetime = datetime.strptime(time, "%Y-%m-%d")
        else:
            time_datetime = time
 
        if card_expiry_date < time_datetime:
            return True
        else:
            return False
 
    except Exception as e:
        print(f"An error occurred in HasCardExpired: {e}")
        return False
 
 
 
 
def makeWithdrawl(PAN, amount):
 
   
    mycursor = mydb.cursor()
    mycursor.execute("call getBalance(%s)", (PAN,))
    selectGET = mycursor.fetchall()
 
    newBalance = selectGET[0][0] - amount
 
    mycursor = mydb.cursor()
    mycursor.execute("call update_Balance(%s, %s)", (PAN, newBalance))
    mydb.commit()
 
 
 
#this checks if the card is valid in 3 ways, login pin and if the card is blocked or expired
def ValidCard(PAN , PIN , Time):
 
    CheckPIN = CorrectPIN(PAN, PIN)
    print(CheckPIN)
 
    if CheckPIN == True:
        print("pin is valid")
    else:
        print("pin is not valid")
 
 
    #checking if the card is blocked or not
    checkBlocked = IsCardBlocked(PAN)
    if checkBlocked == True:
        print("your card is blocked")
    else:
        print("you card is not blocked ;)")
 
 
    #checking if the card is expired or not
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
        #processing jason file
        try:
            request = json.loads(data)
            with open (log_file_name, "a", encoding="utf-8") as log_file:
                log_file.write(str(request)+"\n")
            print(request)
        # if jason is dodgy excemption
        except json.JSONDecodeError:
            response = {
                "TnxID": "null",
                "RespType": 6,
                "msg": "JSON format error"
            }
            incoming_socket.send(json.dumps(response).encode("utf-8"))
            with open (log_file_name, "a", encoding="utf-8") as log_file:
                log_file.write(str(response)+"\n")
            return
 
 
 
        #converts data from json to correct formats to be used
        ID = request.get("TnxID").strip()
        Time = request.get("TnxTime" )
        Time = datetime.strptime(Time, "%Y-%m-%d %H:%M:%S.%f%z")
        Time = Time.date()
        Kind = int(request.get("TnxKind" ))
        Amount = Decimal(request.get("TnxAmount" ))
        PAN = int(request.get("CardNumber" ))
        PIN = int(request.get("PIN" ))
 
 
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
 
 
        dataSent = False
 
       
 
        if isinstance(ID, str) and isinstance(Kind, int) and isinstance(PAN, int) and isinstance(PIN, int) and isinstance(Amount, Decimal):
            dataSent = True
        else:
            dataSent = False
 
 
 
        respType = 0
        respMessage = ""
        isCardValid = False
 
 
        #from here to next comment
        #this code verifys the card and will alwase happen
 
        if dataSent is True:
 
            isCardValid = ValidCard(PAN , PIN , Time)
 
            if isCardValid is True:
 
                mycursor = mydb.cursor()
                mycursor.execute("call getBalance(%s)", (PAN,))
                selectGET = mycursor.fetchall()
 
                respMessage = selectGET[0][0]
                respType = 0
            else:
                respMessage = "Login Unsuccessful"
                respType = isCardValid
        else:
            respMessage = "data sent is invalid"
            respType = 6
 
 
       
 
        #make a withdrawl from the account
        if Kind == 1 and isCardValid == True:
 
            #checking if the card has enough money for the withdrawl
            checkBalance = CorrectFunds(PAN, Amount)
            if checkBalance == False:
                print("you are withdrawing to much")
                respMessage = "Withdraw Exceeds Balance"
                respType = 1
            else:
                print("you can withdraw this")
                makeWithdrawl(PAN , Amount)
                respMessage = "Withdraw Successful"
                respType = 0
 
        #get balance to be displayed
        if Kind == 3 and isCardValid == True:
            mycursor = mydb.cursor()
            mycursor.execute("call getBalance(%s)", (PAN,))
            selectGET = mycursor.fetchall()
 
            respMessage = str(selectGET[0][0])
            respType = 0
       
 
        # deposit cash choice
        if Kind == 2 and isCardValid == True:
           
            Increase = 0 - Amount
            makeWithdrawl(PAN , Increase)
 
            mycursor = mydb.cursor()
            mycursor.execute("call getBalance(%s)", (PAN,))
            selectGET = mycursor.fetchall()
           
            respMessage = str(selectGET[0][0])
            respType = 0
 
 
 
 
 
 
 
 
 
        mycursor = mydb.cursor()
        mycursor.execute(" SELECT * FROM userAccount")
        selectGET = mycursor.fetchall()
 
        for y in selectGET:
            print(y)
 
 
 
 
 
 
 
 
 
        response = {
                "TnxID": request.get("TnxID", ),
                "RespType": respType,
                "msg": respMessage
            }
        print(response)
        incoming_socket.send((json.dumps(response)+"\n").encode("utf-8"))
        with open (log_file_name, "a", encoding="utf-8") as log_file:
            log_file.write(str(response)+"\n")
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
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((tcp_host, tcp_port))
    server_socket.listen(5)
    try:
        while True:
            incoming_socket, incoming_address = server_socket.accept()
            handle_switch_connection(incoming_socket, incoming_address)
    except KeyboardInterrupt:
        print("")
    finally:
        server_socket.close()
 
   
 
 
if __name__ == "__main__":
   
 
    start_server()