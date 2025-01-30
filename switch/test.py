# stress_test.py
import asyncio
import json
import time
import uuid
from datetime import datetime
import statistics
import argparse
from typing import List, Dict

class SwitchStressTest:
    def __init__(self, switch_host: str, switch_port: int, concurrent_users: int, test_duration: int):
        self.switch_host = switch_host
        self.switch_port = switch_port
        self.concurrent_users = concurrent_users
        self.test_duration = test_duration
        self.response_times: List[float] = []
        self.successful_requests = 0
        self.failed_requests = 0
        self.start_time = None

    async def generate_transaction(self) -> Dict:
        """Generate a test transaction similar to the ATM format"""
        return {
            "TnxID": str(uuid.uuid4()),
            "TnxTime": datetime.utcnow().isoformat(),
            "TnxKind": 1,  # 1 for withdrawal, 0 for balance
            "TnxAmount": 100.00,
            "CardNumber": 4532772818527395,  # Test card number
            "PIN": 1234
        }

    async def single_client(self, client_id: int):
        while True:
            if time.time() - self.start_time > self.test_duration:
                break

            try:
                # Create connection
                reader, writer = await asyncio.open_connection(self.switch_host, self.switch_port)

                # Generate and send transaction
                transaction = await self.generate_transaction()
                start_time = time.time()
                
                writer.write(json.dumps(transaction).encode() + b'\n')
                await writer.drain()

                # Wait for response
                response_data = await reader.read(1024)
                response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
                
                if response_data:
                    response = json.loads(response_data.decode())
                    self.response_times.append(response_time)
                    self.successful_requests += 1
                    print(f"Client {client_id} - Transaction {transaction['TnxID']} - Response time: {response_time:.2f}ms")
                    print(f"Response: {response}")

                writer.close()
                await writer.wait_closed()

                # Add small random delay between requests
                await asyncio.sleep(0.1)

            except Exception as e:
                self.failed_requests += 1
                print(f"Error in client {client_id}: {str(e)}")
                await asyncio.sleep(1)  # Wait before retrying

    def print_statistics(self):
        if not self.response_times:
            print("No successful requests to calculate statistics")
            return

        print("\n=== Test Results ===")
        print(f"Total Requests: {self.successful_requests + self.failed_requests}")
        print(f"Successful Requests: {self.successful_requests}")
        print(f"Failed Requests: {self.failed_requests}")
        print(f"Average Response Time: {statistics.mean(self.response_times):.2f}ms")
        print(f"Min Response Time: {min(self.response_times):.2f}ms")
        print(f"Max Response Time: {max(self.response_times):.2f}ms")
        if len(self.response_times) >= 20:
            print(f"95th Percentile: {statistics.quantiles(self.response_times, n=20)[-1]:.2f}ms")
        print(f"Requests per second: {self.successful_requests / self.test_duration:.2f}")

    async def run_test(self):
        print(f"Starting stress test with {self.concurrent_users} concurrent users")
        print(f"Test duration: {self.test_duration} seconds")
        print(f"Target switch: {self.switch_host}:{self.switch_port}")
        
        self.start_time = time.time()
        
        # Create tasks for each concurrent user
        tasks = [self.single_client(i) for i in range(self.concurrent_users)]
        
        # Run all tasks concurrently
        await asyncio.gather(*tasks)
        
        self.print_statistics()

def main():
    parser = argparse.ArgumentParser(description='Switch Stress Testing Tool')
    parser.add_argument('--host', default='localhost', help='Switch host')
    parser.add_argument('--port', type=int, default=8080, help='Switch port')
    parser.add_argument('--users', type=int, default=10, help='Number of concurrent users')
    parser.add_argument('--duration', type=int, default=60, help='Test duration in seconds')
    
    args = parser.parse_args()
    
    # Create and run the stress test
    stress_test = SwitchStressTest(args.host, args.port, args.users, args.duration)
    asyncio.run(stress_test.run_test())

if __name__ == "__main__":
    main()
