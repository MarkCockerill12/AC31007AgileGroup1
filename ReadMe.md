# AC31007 - Agile Software Development Group 1
## Sprint One: Jan 20th - Jan 26th
## Sprint Two: Jan 27th - Fri 31st

## Description
### Main Tasks:
**Create an ATM Application** :shipit:
We have been tasked with creating a functioning ATM prototype app that works with mouse inputs in order to simulate card entry and cash dispense mechanisms.
It must:
* Run on a desktop operating system
* Be a full screen GUI application
* Connect to the Transaction Switch to authorise transactions
* Have a menu with two possible transactions:
    * Cash Withdrawal
        * Added caveat that you must not be able to acquire simulated cash before authorisation is complete
    * Balance Inquiry

> Our solution to this task involves the creation of an Electron desktop app using React.js, Typescript, and Tailwind.CSS to generate an appealing User Interface that sufficiently runs on all necessary platforms without additional integrations. This also allowed all team members to collaborate, work, and run the ATM without additional fuss related to different operating systems.

**Create a Server Application (Transaction Switch)**
In addition to the functioning ATM Front-end, we have also been tasked with creating a server application that runs as the Transaction Switch of the ATM Transaction Flow. In essence it should be able to take authorisation requests from the ATM and forward them to the correct network for identification and verification. More specifically it must:
* Expose an API that the ATM application connects to and calls
* Must be able to print transactions flowing through the switch in a log file
* Route transactions to the network simulator and return responses from the simulator back to the calling ATM
> Our solution to this task involves the use of Go to parse our defined json structure, handling the connection to the ATM and to the simulation, and routing the transaction data correctly. Go was chosen for its robustness, simplicity, and ability to integrate into various other applications easily.

**Create a Network Simulator**
Finally we have been tasked with creating a functioning Network Simulator that serves as a mock up of the network the Transaction Switch would connect to in an actual ATM flow. Feasibly it should route authorisation requests to the bank issuer, however for our case it should just automatically authorise requests on its own. It must:
* Be able to print transactions flowing through the simulator into a log file
* Should be able to automatically approve the transaction and return a response to the Transaction Switch

> In order to solve this we've setup an Amazon Web Services server that accepts our JSON format in TCP/IP, checking the contents of the JSON data with a mySQL database that stores various data regarding legitimate card details, and either returning a success or failure message to the Transaction Switch.

### Agile
In order to progress through the coursework, we have to follow the principles of Agile; assigning the role of Scrum Leader and Project Owner to two members of our group, creating a product backlog consisting of suitable user stories alongside creating and updating a similar sprint backlog. In tandem we must use these mechanisms of management to develop the components specified above in the [Description](#description).

Similarly we must display a solid understanding of both agile methods and demonstrate appropriate quality standards in:
- The refactoring of code
- Code reviews
- Daily Scrums
- User of Pair Programming
- Regular and Informative use of GitHub

**Our Github Repo must contain:**
- [ ] All source code for our project and the .exe for our Electron app
- [ ] Project Documents including:
    - [ ] Product Backlog (Github Project Board)
    - [ ] Sprint Backlog (Github Project Board)
- [ ] A link to a video of one of our scrum meetings
