# dummy_sim.py
import socket
import json
import time
from datetime import datetime

class DummySimulator:
    def __init__(self, host="0.0.0.0", port=31007):
        self.host = host
        self.port = port
        self.server_socket = None

    def start(self):
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(5)
        print(f"Dummy simulator listening on {self.host}:{self.port}")

        while True:
            try:
                client_socket, address = self.server_socket.accept()
                self.handle_connection(client_socket, address)
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")

    def handle_connection(self, client_socket, address):
        try:
            data = client_socket.recv(1024).decode("utf-8")
            request = json.loads(data)
            print(f"Received request: {request}")

            # Create response similar to the real simulator
            response = {
                "TnxID": request.get("TnxID", ""),
                "RespType": 0,  # 0 for success
                "msg": "Successful Transaction"
            }

            # Add small random delay to simulate processing
            time.sleep(0.1)
            
            client_socket.send((json.dumps(response) + "\n").encode("utf-8"))
        except Exception as e:
            print(f"Error handling connection: {e}")
        finally:
            client_socket.close()

if __name__ == "__main__":
    simulator = DummySimulator()
    simulator.start()
