/*jshint esversion: 6 */

//after upload, call hash function


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
  //creating an instance of the contract
  const web3 = new Web3("http://localhost:7545");
  contract = new web3.eth.Contract(abi, address);
  getAccount().then(temp_acc => {
    if(temp_acc !== null) {
      acc = temp_acc;
      $("#upload_button").prop('disabled', false);
      first_fade("alert-info", "Connected!", " Account: <br>" + acc);
    }
  });
  if(acc === null) {
    $("#upload_button").prop('disabled', true);
    first_fade("alert-warning", "Warning!", " No account detected. Upload access is disabled.");
  }
  //After file upload, but before any button is pressed
  $('input').change(function() {
    var files = get_filename();
    if(files !== null && files[0] !== undefined) {
      if(files.length <= 10) {
        $('.upload_class').empty();
        for(var i = 0; i < files.length; i++) {
          $("#message").empty();
          if(files[i].name.split('.')[files[i].name.split('.').length - 1] !== "pdf") {
            second_fade("alert-danger", "Error! ", files[i].name + " is of an invalid file type. <br> Please upload PDF files only.");
            //$("#upload_button").prop('disabled', true);
            //$("#find_button").prop('disabled', true);
            //break;
          } else {
            $('.upload_class').append("<p>" + files[i].name + "</p>");
            $("#message").fadeOut("slow");
            //$("#upload_button").prop('disabled', false);
            //$("#find_button").prop('disabled', false);
          }
        }
        //change top and bottom paddings of text inside dashed box
        var temp = (200 - ($('.upload_class p').css("line-height").replace(/[^-\d\.]/g, '') * $('.upload_class p').length)) / 2;
        $('.upload_class').css({
          "padding-top": temp,
          "padding-bottom": temp
        });
        $("input").css("height", $(".box").css("height"));
      } else if(files.length > 10) second_fade("alert-danger", "Error!", " Only 10 files can be uploaded at once.");
    }
  });
  //Add event listener to both buttons
  document.getElementById("upload_button").addEventListener("click", function() {
    hash_file(function(err, hash) {
      verify(hash, function(err, resultObj) {
        $("#message").empty();
        var filename = get_filename();
        if(resultObj.block_number > 0) {
          second_fade("alert-danger", "Error!", " <br> " + filename + " was already uploaded on <br>" + resultObj.timestamp);
          console.log(filename + " found at block #" + resultObj.block_number);
        } else {
          upload_to_blockchain(hash, function(err, tx) {
            if(tx !== null) {
              second_fade("alert-success", "Success!", filename + " has been uploaded.");
              console.log(filename + " uploaded with transaction ID: " + tx);
            } else {
              second_fade("alert-danger", "Error!", "Please try again.");
            }
          });
        }
      });
    });
  });
  document.getElementById("find_button").addEventListener("click", function() {
    hash_file(function(err, hash) {
      verify(hash, function(err, resultObj) {
        $("#message").empty();
        var filename = get_filename();
        if(resultObj.block_number > 0) {
          second_fade("alert-success", "Valid!", " <br>" + filename + " was uploaded on <br>" + resultObj.timestamp);
          console.log(filename + " found at block #" + resultObj.block_number);
        } else {
          second_fade("alert-danger", "Invalid!", filename + " cannot be verified.");
        }
      });
    });
  });
});
//hash the input file
function hash_file(callback) {
  var input = document.getElementById("file_input");
  if(document.getElementById("file_input").files.length === 0) {
    $("#message").empty();
    second_fade("alert-danger", "Error!", " Please select a file first.");
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
//sends the hash to the blockchain
function upload_to_blockchain(hash, callback) {
  contract.methods.upload(hash).send({
    from: acc
  }, function(error, tx) {
    if(error) callback(error, null);
    else callback(null, tx);
  });
}
//looks up the hash on the blockchain
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

function first_fade(special_class, message1, message2) {
  $("#first_message").fadeOut(100, function() {
    $("#first_message").removeClass("alert-warning alert-info").addClass(special_class);
    $("#first_message").html("<strong>" + message1 + "</strong> " + message2);
    $("#first_message").fadeIn("slow");
  });
}

function second_fade(special_class, message1, message2) {
  $("#message").fadeOut(100, function() {
    $("#message").append("<div class='alert " + special_class + "' id=second_message>" + "<strong>" + message1 + "</strong>" + message2 + "</div>");
    $("#message").fadeIn("slow");
  });
}

function get_filename() {
  var fileInput = document.getElementById('file_input');
  if(fileInput.files.length !== null) return fileInput.files;
  else return null;
}