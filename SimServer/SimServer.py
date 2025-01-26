import socket
import json
import mysql.connector
from datetime import datetime

#Config
tcp_host = "0.0.0.0"
tcp_port = 31007
buffer_size = 1024

#DB Config
db_host = "localhost"
user = "user"
password = "AC31007"

def handle_switch_connection(incoming_socket, incoming_address):
    try:
        data = incoming_socket.recv(buffer_size).decode("utf-8")
        try:
            request = json.loads(data)
            print(request)
        except json.JSONDecodeError:
            response = {
                "TnxID": "null",
                "RespType": 1,
                "msg": "JSON format error"
            }
            incoming_socket.send(json.dumps(response).encode("utf-8"))
            return
        response = {
                "TnxID": request.get("transaction_id", "000"),
                "RespType": 0,
                "msg": "Successful Transaction"
            }
        print(response)
        incoming_socket.send((json.dumps(response)+"\n").encode("utf-8"))
    finally:
        incoming_socket.close()
        
def start_server():
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