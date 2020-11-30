/*jshint esversion: 6 */
var contract = null;
var address = "0x25bcC9C2d839502695d88AaD3DfCE7942B627d92"; //contract address
$(document).ready(function() {
  abi = [{
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
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
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }];
  //creating an instance of the contract
  const web3 = new Web3("http://localhost:7545")
  contract = new web3.eth.Contract(abi, address)
});
//hash input file
function hashForFile(callback) {
  input = document.getElementById("file_input");
  if( document.getElementById("file_input").files.length == 0 ){
  //if(!input.files[0]) {
    alert("Please select a file first");
  } else {
    file = input.files[0];
    fr = new FileReader();
    fr.onload = function(e) {
      content = e.target.result;
      var shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
      shaObj.update(content);
      var hash = "0x" + shaObj.getHash("HEX");
      callback(null, hash);
    };
    fr.readAsArrayBuffer(file);
  }
};
//Upload button is pressed
document.getElementById("upload_button").addEventListener("click", function() {
  hashForFile(function(err, hash) {
    notary_send(hash, function(err, tx) {
      if(tx != null) {
        $("#error_message").fadeOut(100, function() {
          $("#valid_message").fadeOut(100, function() {
            $("#upload_message").fadeIn(100, function() {
              $("#upload_message").html("<strong>Success!</strong> Transaction ID: " + tx + ".");
            });
          });
        });
      } else {
        $("#valid_message").fadeOut(100, function() {
          $("#upload_message").fadeOut(100, function() {
            $("#error_message").fadeIn(100, function() {
              $("#error_message").html("<strong>Error!</strong> Please try again.");
            });
          });
        });
      }
    });
  });
});
//Find button is pressed
document.getElementById("find_button").addEventListener("click", function() {
  hashForFile(function(err, hash) {
    notary_find(hash, function(err, resultObj) {
      if(resultObj.blockNumber != null) {
        $("#error_message").fadeOut(100, function() {
          $("#upload_message").fadeOut(100, function() {
            $("#valid_message").fadeIn(100, function() {
              $("#upload_message").html("<strong>Success!</strong> Certificate is valid.");
            });
          });
        });
      } else {
        $("#valid_message").fadeOut(100, function() {
          $("#upload_message").fadeOut(100, function() {
            $("#error_message").fadeIn(100, function() {
              $("#error_message").html("<strong>Error!</strong> Please try again.");
            });
          });
        });
      }
    });
  });
});
//sends the hash to the blockchain
function notary_send(hash, callback) {
  getAccount().then(acc => {
    if(acc != null) {
      console.log("New file upload: " + hash);
      contract.methods.addDocHash(hash).send({
        from: acc
      }, function(error, tx) {
        if(error) callback(error, null)
        else callback(null, tx)
      });
    } else {
      alert("Unable to connect to account!");
    }
  })
}
//looks up the hash on the blockchain
function notary_find(hash, callback) {
  if(hash != null) {
    contract.methods.findDocHash(hash).call(function(error, result) {
      if(error) callback(error, null);
      else {
        let resultObj = {
          blockNumber: result[0]
        };
        callback(null, resultObj);
      }
    });
  }
}
async function getAccount() {
  const accounts = await ethereum.request({
    method: 'eth_requestAccounts'
  });
  return accounts[0];
}