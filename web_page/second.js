/*jshint esversion: 6 */
var contract = null;
var address = "0x6D97310b646F9ADCfcbC4596f5a993857dC6Eb2D"; //contract address
var acc = null;
$(document).ready(function() {
  var abi = [{
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  }, {
    "constant": false,
    "inputs": [{
      "name": "file_hash",
      "type": "bytes32"
    }],
    "name": "upload",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "file_hash",
      "type": "bytes32"
    }],
    "name": "verify",
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
  //Creating an instance of the contract
  const web3 = new Web3("http://localhost:7545");
  contract = new web3.eth.Contract(abi, address);
  getAccount().then(temp_acc => {
    if(temp_acc !== null) {
      acc = temp_acc;
      $("#upload_button").prop('disabled', false);
      fade_in("alert-info", "Connected!", " Account: <br>" + acc);
    }
  });
  if(acc === null) {
    $("#upload_button").prop('disabled', true);
    fade_in("alert-warning", "Warning!", " No account connected. Upload access is disabled.");
  }
  //After file upload, but before any button is pressed
  $('input').change(function() {
    var fileInput = document.getElementById('file_input');
    if(fileInput.files.length !== null) {
      var filename = fileInput.files[0].name;
      var parts = filename.split('.');
      $('#upload_text').html("<p>" + filename + "</p>");
      if(parts[parts.length - 1] !== "pdf") {
        fade_in("alert-danger", "Error!", "Invalid file type. Please upload PDF files only.");
        $("#upload_button").prop('disabled', true);
        $("#find_button").prop('disabled', true);
      } else {
        $("#message").fadeOut("slow");
        $("#upload_button").prop('disabled', false);
        $("#find_button").prop('disabled', false);
      }
    }
  });
  //Adding event listeners to both buttons
  document.getElementById("upload_button").addEventListener("click", function() {
    hash_file(function(err, hash) {
      verify(hash, function(err, resultObj) {
        if(resultObj.block_number > 0) {
          fade_in("alert-danger", "Error!", " <br> Certificate was already uploaded on <br>" + resultObj.timestamp);
          console.log("Existing hash found at block #" + resultObj.block_number);
        } else {
          upload_to_blockchain(hash, function(err, tx) {
            if(tx !== null) {
              fade_in("alert-success", "Success!", "Transaction ID: " + tx + ".");
              console.log("New certificate upload with hash: " + hash);
            } else {
              fade_in("alert-danger", "Error!", "Please try again.");
            }
          });
        }
      });
    });
  });
  document.getElementById("find_button").addEventListener("click", function() {
    hash_file(function(err, hash) {
      verify(hash, function(err, resultObj) {
        if(resultObj.block_number > 0) {
          fade_in("alert-success", "Valid!", " <br> Certificate was uploaded on <br>" + resultObj.timestamp);
          console.log("Hash found at block #" + resultObj.block_number);
        } else {
          fade_in("alert-danger", "Invalid!", "Input certificate cannot be verified.");
        }
      });
    });
  });
});
//Function to hash the input file
function hash_file(callback) {
  var input = document.getElementById("file_input");
  if(document.getElementById("file_input").files.length === 0) {
    fade_in("alert-danger", "Error!", "Please select a file first.");
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
//Function that sends the hash to the blockchain
function upload_to_blockchain(hash, callback) {
  contract.methods.upload(hash).send({
    from: acc
  }, function(error, tx) {
    if(error) callback(error, null);
    else callback(null, tx);
  });
}
//Function that looks up the hash on the blockchain
function verify(hash, callback) {
  if(hash !== null) {
    contract.methods.verify(hash).call(function(error, result) {
      if(error) callback(error, null);
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
//Function that displays alert messages
function fade_in(identifier, message1, message2) {
  $("#message").fadeOut(100, function() {
    $("#message").removeClass("alert-success alert-warning alert-danger alert-info").addClass(identifier);
    $("#message").html("<strong>" + message1 + "</strong> " + message2);
    $("#message").fadeIn("slow");
  });
}