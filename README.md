# my_FYP
Digital Certificate Verification System Utilizing Permissioned Blockchain

#Pre-requisites
1. Ganache GUI (or any valid alternative).
2. http-server (or any valid alternative).
3. npm (to install truffle).
3. truffle: npm install -g truffle

#Smart contracts
1. cd into project folder, then execute this command: truffle compile
2. Navigate to project_folder/build/contracts/certificate.json
3. Copy values for abi.
4. Navigate to project_folder/web_page/here.js
5. Replace abi values with what was copied.

#Blockchain network
1. In Ganache, click on New Workspace (Ethereum).
2. Under Chain, set GAS PRICE to be 0. Everything else can be left at their default values.
3. Click on "Save Workspace" at the top right.
4. Copy Network ID and RPC Server. Usually they are "5777" and "http://127.0.0.1:7545"
5. Under tha account's tab, copy any account's public address.
6. Navigate to project_folder/truffle.js
7. Replace values for "host", "port", "network ID" and "from" with what was copied.
8. cd into project folder, and execute this command: truffle migrate
9. In the output, copy contract address for certificate.sol.
10. Navigate to here.js, and replace value for "address" variable with what was copied.

#Metamask
#Later
1. Under Networks, click on "Add Network".
2. Give it a name (can be anything you want).
3. RPC URL = RPC Server inside Ganache.
4. For Chain ID, there currently is no way to get it from Ganache GUI. So, enter a random number, and click "Save". Then, a message would pop-up giving you the proper Chain ID to input.
5. Leave everything else blank, and click "Save".
6. Click on the icon in the blue ring, and select "Import Account".
7. In Ganache GUI, under the Accounts tab, under any account, click on the key icon at the right 
8. Copy the Private Key and paste into MetaMask.

#Web page
1. cd to project_folder/web_page
2. Execute command: http-server . (a full-stop at the end)
3. In a web-browser, enter the url: localhost:8080
4. Upload and verify documents.
