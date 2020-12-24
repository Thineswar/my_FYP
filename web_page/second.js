/*jshint esversion: 6 */
//test if filetype checking works
//generate only 1 success message
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
  //After file upload, but before any button is pressed
  $('input').change(function() {
    get_filename(function(files) {
      if(files.length <= 10) {
        $('.upload_class').empty();
        for(var i = 0; i < files.length;) {
          $("#alert_message").fadeOut(100, function(){
            $("#message").empty();
          });
          $("#message").empty();
          //check for filetype
          if(files[i].name.split('.')[files[i].name.split('.').length - 1] !== "pdf") {
            fade_in("alert-danger", "Error! ", files[i].name + " is of an invalid file type. <br> Please upload PDF files only.");
            //remove file from array
            files.splice(i, 1);
            //no need all these, since the file is removed
            //$("#upload_button").prop('disabled', true);
            //$("#find_button").prop('disabled', true);
            //break;
          } else {
            $('.upload_class').append("<p>" + files[i].name + "</p>");
            $("#message").fadeOut("slow", function() {
              $("#upload_button").prop('disabled', false);
              $("#find_button").prop('disabled', false);
            });
            i++;
          }
        }
        //change top and bottom paddings of text inside dashed box
        var temp = (200 - ($('.upload_class p').css("line-height").replace(/[^-\d\.]/g, '') * $('.upload_class p').length)) / 2;
        $('.upload_class').css({
          "padding-top": temp,
          "padding-bottom": temp
        });
        //fill dashed box with file input
        $("input").css("height", $(".box").css("height"));
      } else if(files.length > 10) fade_in("alert-danger", "Error!", " Only 10 files can be uploaded at once.");
    });
    //if(files !== null && files[0] !== undefined) {
  });
  //Add event listener to both buttons
  document.getElementById("upload_button").addEventListener("click", function() {
    $("#message").empty();
    get_filename(function(files) {
      for(var i = 0; i < files.length; i++) {
        hash_file(files[i], function(filename, hash) {
          verify(hash, function(resultObj) {
            if(resultObj !== null && resultObj.block_number > 0) {
              fade_in("alert-danger", "Error!", " <br> " + filename + " was already uploaded on <br>" + resultObj.timestamp);
              console.log(filename + " already exists at block #" + resultObj.block_number);
            } else {
              upload_to_blockchain(hash, function(tx) {
                fade_in("alert-success", "Success! ", files[i].name + " has been uploaded.");
                console.log(files[i].name + " uploaded with transaction ID: " + tx);
              });
            }
          });
        })
      }
    })
  });
  document.getElementById("find_button").addEventListener("click", function() {
    $("#message").empty();
    get_filename(function(files) {
      for(var i = 0; i < files.length; i++) {
        hash_file(files[i], function(filename, hash) {
          verify(hash, function(resultObj) {
            if(resultObj !== null && resultObj.block_number > 0) {
              fade_in("alert-success", "Valid! ", " <br>" + filename + " was uploaded on <br>" + resultObj.timestamp);
              console.log(filename + " found at block #" + resultObj.block_number);
            } else {
              fade_in("alert-danger", "Invalid! ", filename + " cannot be verified.");
              console.log(filename + " was not found in the blockchain.");
            }
          });
        });
      }
    });
  });
  //if metamask isn't installed
  if (typeof Web3 == 'undefined'){
    $('#upload_button').remove();
    $('.right_button').css("margin-left", "0%");
  }
  else{
    //creating an instance of the contract
    const web3 = new Web3("http://localhost:7545");
    contract = new web3.eth.Contract(abi, address);
    getAccount().then(temp_acc => {
      acc = temp_acc;
      $("#upload_button").prop('disabled', false);
      $('#alert_message').remove();
      fade_in("alert-info", "Connected!", " Account: <br>" + acc);
    });

    setTimeout(function(){
      if (acc === null){
        $("#upload_button").prop('disabled', true);
        $('#alert_message').remove();
        fade_in("alert-warning", "Warning!", " Account is locked. Upload access is disabled.");
      }
    }, 50);

  }
});
//hash the input file
function hash_file(file, callback) {
  var fr = new FileReader();
  fr.readAsArrayBuffer(file);
  fr.onload = function(e) {
    var temp = CryptoJS.lib.WordArray.create(fr.result);
    var hash = "0x" + CryptoJS.SHA256(temp).toString();
    callback(file.name, hash);
  };
}
//sends the hash to the blockchain
function upload_to_blockchain(hash, callback) {
  contract.methods.upload(hash).send({
    from: acc
  }, function(error, tx) {
    if(error) fade_in("alert-danger", "Error!", " Please try again.");
    else callback(tx);
  });
}
//looks up the hash on the blockchain
function verify(hash, callback) {
  contract.methods.verify(hash).call(function(error, result) {
    if(!error) {
      let resultObj = {
        timestamp: new Date(result[0] * 1000),
        block_number: result[1]
      };
      callback(resultObj);
    } else callback(null);
  });
}
//Get account in MetaMask
async function getAccount() {
  const accounts = await ethereum.request({
    method: 'eth_requestAccounts'
  });
  return accounts[0];
}

function fade_in(special_class, message1, message2) {
  $("#message").fadeOut("fast", function() {
    $("#message").append("<div class='alert " + special_class + "' id=alert_message>" + "<strong>" + message1 + "</strong>" + message2 + "</div>");
    $("#message").fadeIn("slow");
  });
}

function get_filename(callback) {
  var fileInput = document.getElementById('file_input');
  if(fileInput.files.length === 0) {
    $("#alert_message").remove();
    fade_in("alert-danger", "Error!", " Please select a file first.");
  }
  else callback(fileInput.files);
}