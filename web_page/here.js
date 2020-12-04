/*jshint esversion: 6 */
var contract = null;
var address = "0xcBB073D67027D1fD2c520CDb731365BC22577FF9"; //contract address
$(document).ready(function() {
  var abi = [{
    "constant": false,
    "inputs": [],
    "name": "Notary",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "hash",
      "type": "bytes32"
    }],
    "name": "addDocHash",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "hash",
      "type": "bytes32"
    }],
    "name": "findDocHash",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }];
  //creating an instance of the contract
  const web3 = new Web3("http://localhost:7545");
  contract = new web3.eth.Contract(abi, address);
});
//hash the input file
function hash_file(callback) {
  var input = document.getElementById("file_input");
  if (document.getElementById("file_input").files.length === 0) {
    alert("Please select a file first");
  } else {
    var file = input.files[0];
    var fr = new FileReader();
    fr.onload = function(e) {
      var content = e.target.result;
      var shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
      shaObj.update(content);
      var hash = "0x" + shaObj.getHash("HEX");
      callback(null, hash);
    };
    fr.readAsArrayBuffer(file);
  }
}
//Upload button is pressed
document.getElementById("upload_button").addEventListener("click", function() {
  hash_file(function(err, hash) {
    upload_to_blockchain(hash, function(err, tx) {
      if (tx !== null) {
        $("#error_message").fadeOut(100, function() {
            $("#upload_message").fadeIn(100, function() {
              $("#upload_message").html("<strong>Success!</strong> Transaction ID: " + tx + ".");
            });
        });
      } else {
          $("#upload_message").fadeOut(100, function() {
            $("#error_message").fadeIn(100, function() {
              $("#error_message").html("<strong>Error!</strong> Please try again.");
            });
          });
      }
    });
  });
});
//Find button is pressed
document.getElementById("find_button").addEventListener("click", function() {
  hash_file(function(err, hash) {
    verify(hash, function(err, resultObj) {
      if (resultObj.blockNumber !== 0) {
        $("#error_message").fadeOut(100, function() {
          $("#upload_message").fadeIn(100, function() {
            console.log("Hash found at block #" + resultObj.blockNumber);
            $("#upload_message").html("<strong>Valid!</strong> <br> Certificate was issued on " + resultObj.timestamp);
          });
        });
      } else {
          $("#upload_message").fadeOut(100, function() {
            $("#error_message").fadeIn(100, function() {
              $("#error_message").html("<strong>Error!</strong> Please try again.");
            });
          });
      }
    });
  });
});
//sends the hash to the blockchain
function upload_to_blockchain(hash, callback) {
  getAccount().then(acc => {
    if (acc !== null) {
      console.log("New file upload: " + hash);
      contract.methods.upload(hash).send({
        from: acc
      }, function(error, tx) {
        if (error) callback(error, null);
        else callback(null, tx);
      });
    } else {
      alert("Unable to connect to account!");
    }
  });
}
//looks up the hash on the blockchain
function verify(hash, callback) {
  if (hash !== null) {
    contract.methods.verify(hash).call(function(error, result) {
      if (error) callback(error, null);
      else {
        let resultObj = {
          timestamp: new Date(result[0] * 1000),
          blockNumber: result[1]
        };
        callback(null, resultObj);
      }
    });
  }
}
//Get account in MetaMask
async function getAccount() {
  const accounts = await ethereum.request({
    method: 'eth_requestAccounts'
  });
  return accounts[0];
}