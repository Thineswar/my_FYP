/*jshint esversion: 6 */
var contract = null;
var address = "0x6D97310b646F9ADCfcbC4596f5a993857dC6Eb2D"; //contract address
$(document).ready(function() {
  var abi = [
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "file_hash",
          "type": "bytes32"
        }
      ],
      "name": "upload",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "file_hash",
          "type": "bytes32"
        }
      ],
      "name": "verify",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];
  //creating an instance of the contract
  const web3 = new Web3("http://localhost:7545");
  contract = new web3.eth.Contract(abi, address);
});
//hash the input file
function hash_file(callback) {
  var input = document.getElementById("file_input");
  if (document.getElementById("file_input").files.length === 0) {
    fade_in("error_message", "Error!", "Please select a file first.");
  } else {
    var file = input.files[0];
    var fr = new FileReader();
    fr.onload = function(e) {
      var temp = CryptoJS.lib.WordArray.create(fr.result);
      var hash = "0x" + CryptoJS.SHA256(temp).toString();
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
        fade_in("success_message", "Success!", "Transaction ID: " + tx + ".");
        console.log("New file upload with hash: " + hash);
      } else {
        fade_in("error_message", "Error!", "Please try again.");
      }
    });
  });
});
//Find button is pressed
document.getElementById("find_button").addEventListener("click", function() {
  hash_file(function(err, hash) {
    verify(hash, function(err, resultObj) {
      if (resultObj.block_number > 0) {
        fade_in("success_message", "Valid!", " <br> Certificate was issued on " + resultObj.timestamp);
        console.log("Hash found at block #" + resultObj.block_number);
      } else {
        fade_in("error_message", "Invalid!", "Input file cannot be verified.");
      }
    });
  });
});
//sends the hash to the blockchain
function upload_to_blockchain(hash, callback) {
  getAccount().then(acc => {
    if (acc !== null) {
      contract.methods.upload(hash).send({
        from: acc
      }, function(error, tx) {
        if (error) callback(error, null);
        else callback(null, tx);
      });
    } else {
      $("#success_message").fadeOut(100, function() {
        $("#error_message").fadeIn(100, function() {
          $("#error_message").html("<strong>Error!</strong> Unable to connect to MetaMask account.");
        });
      });
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
          block_number: result[1]
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

function fade_in(identifier, message1, message2){
  $("#error_message").fadeOut(100, function() {
    $("#success_message").fadeOut(100, function() {
      $("#"+identifier).html("<strong>" + message1 + "</strong> " + message2);
      $("#"+identifier).fadeIn("slow");
    });
  });
}