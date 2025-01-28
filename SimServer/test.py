import socket
import json
from datetime import datetime

def send_json(target_host, target_port):
    try:
        # Hardcoded JSON data
        json_data = {
            "TnxID": "100", 
            "TnxTime": str(datetime.now()), 
            "TnxKind": 1, 
            "TnxAmount": 45.0,
            "CardNumber": 12,
            "PIN": 1456
        }

        # Convert the JSON data to a string
        json_string = json.dumps(json_data)

        # Create a socket object
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
            # Connect to the target server
            client_socket.connect((target_host, target_port))
            print(f"Connected to {target_host}:{target_port}")

            # Send the JSON string
            client_socket.sendall(json_string.encode('utf-8'))
            print("JSON data sent successfully.")

            response = client_socket.recv(1024)  # Adjust buffer size if needed
            print("Response received from server:", response.decode('utf-8'))

    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
target_host = "54.85.70.115"  # Target server's IP address
target_port = 31007        # Target server's port

send_json(target_host, target_port)
