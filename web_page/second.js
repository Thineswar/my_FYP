/*jshint esversion: 6 */
var contract = null;
var address = "0x6D97310b646F9ADCfcbC4596f5a993857dC6Eb2D"; //contract address
var acc = null;
var file_array = [];
$(document).ready(function () {
  var abi = [
    {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      constant: false,
      inputs: [
        {
          name: "file_hash",
          type: "bytes32",
        },
      ],
      name: "upload",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "file_hash",
          type: "bytes32",
        },
      ],
      name: "verify",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  //After file upload, but before any button is pressed
  $("input").change(function () {
    $(".upload_class").empty();
    $("#message").fadeOut("slow", function () {
      $(this).empty();
    });
    get_filename(function (files) {
      if (files.length <= 10) {
        for (var i = 0; i < files.length; i++) {
          //check for filetype
          if (
            files[i].name.split(".")[files[i].name.split(".").length - 1] !==
            "pdf"
          ) {
            fade_in(
              "alert-danger",
              "Error! ",
              files[i].name +
                " is of an invalid file type. <br> Please upload PDF files only."
            );
          } else {
            file_array.push(files[i]);
            $(".upload_class").append("<p>" + files[i].name + "</p>");
            $("#message").fadeOut("slow");
          }
        }
      } else if (files.length > 10) fade_in("alert-danger", "Error!", " Only 10 files can be uploaded at once.");
    });
    if ($(".upload_class").is(":empty")) {
      //not even one pdf file was selected
      pull_down(function () {
        $(".upload_class").append("<p>Click here to choose file <br> (.pdf only)</p>");
        $(".upload_class").animate({
          "padding-top": 68.5,
          "padding-bottom": 68.5,
        });
      });
    } else {
      //change top and bottom paddings of text inside dashed box
      var temp =
        (200 -
          $(".upload_class p")
            .css("line-height")
            .replace(/[^-\d\.]/g, "") *
            $(".upload_class p").length) /
        2;
      if (temp < 40) temp = 40;
      $(".upload_class").animate({
        "padding-top": temp,
        "padding-bottom": temp,
      });
      //fill dashed box with file input
      setTimeout(function () {
        $("#file_input").css("height", $(".box").css("height"));
      }, 500);
    }
  });
  $("#find_button").on("click", function () {
    var success_count = 0,
      failed = [],
      failed_timestamp = [];
    $(this).prop("disabled", true);
    $("#message").empty();

    function verify_all(current_file, callback) {
      hash_file(current_file, function (filename, hash) {
        verify(hash, function (resultObj) {
          if (resultObj !== null && resultObj.block_number > 0) {
            if (file_array.length === 1)
              fade_in("alert-success", "Valid! ", filename + " is legitimate.");
            else success_count++;
            console.log(
              filename + " found at block #" + resultObj.block_number
            );
            callback();
          } else {
            failed.push(filename);
            console.log(filename + " was not found in the blockchain.");
            callback();
          }
        });
      });
    }

    function iterate(callback) {
      pull_up(function () {
        for (var i = 0; i < file_array.length; i++) {
          verify_all(file_array[i], callback);
        }
      });
    }
    if (file_array.length === 0)
      fade_in("alert-danger", "Error!", " Please select a file first.");
    else {
      iterate(function () {
        if (success_count + failed.length === file_array.length) {
          if (success_count > 0) {
            if (success_count === file_array.length)
              fade_in(
                "alert-success",
                "Valid! ",
                " All " + success_count + " certificates are legitimate."
              );
            else
              fade_in(
                "alert-success",
                "Valid! ",
                success_count +
                  " of " +
                  file_array.length +
                  " certificates are legitimate."
              );
          }
          for (var i = 0; i < failed.length; i++)
            fade_in(
              "alert-danger",
              "Invalid! ",
              failed[i] + " cannot be verified."
            );
        }
      });
    }

    setTimeout(function () {
      $("#find_button").prop("disabled", false);
    }, 500);
  });
  //if metamask isn't installed
  if (typeof Web3 == "undefined") {
    $("#upload_button").remove();
    $(".right_button").css("margin-left", "0%");
  } else {
    $("#upload_button").on("click", function () {
      var success_count = 0,
        failed = [],
        failed_timestamp = [];
      $(this).prop("disabled", true);
      $("#message").empty();

      function upload(current_file, callback) {
        hash_file(current_file, function (filename, hash) {
          verify(hash, function (resultObj) {
            if (resultObj !== null && resultObj.block_number > 0) {
              failed.push(filename);
              failed_timestamp.push(resultObj.timestamp);
              console.log(
                filename + " already exists at block #" + resultObj.block_number
              );
              callback();
            } else {
              upload_to_blockchain(hash, function (tx) {
                if (file_array.length === 1)
                  fade_in(
                    "alert-success",
                    "Success! ",
                    filename + " has been uploaded."
                  );
                else success_count++;
                console.log(filename + " uploaded with transaction ID: " + tx);
                callback();
              });
            }
          });
        });
      }

      function iterate(callback) {
        pull_up(function () {
          for (var i = 0; i < file_array.length; i++)
            upload(file_array[i], callback);
        });
      }
      if (file_array.length === 0)
        fade_in("alert-danger", "Error!", " Please select a file first.");
      else {
        iterate(function () {
          if (success_count + failed.length === file_array.length) {
            if (success_count > 0)
              fade_in(
                "alert-success",
                "Success! ",
                success_count + " files have been uploaded."
              );
            for (var i = 0; i < failed.length; i++)
              fade_in(
                "alert-danger",
                "Error!",
                " <br> " +
                  failed[i] +
                  "<br> was already uploaded on <br>" +
                  failed_timestamp[i]
              );
          }
        });
      }
      setTimeout(function () {
        $("#upload_button").prop("disabled", false);
      }, 500);
    });
    //creating an instance of the contract
    const web3 = new Web3("http://localhost:7545");
    contract = new web3.eth.Contract(abi, address);
    getAccount().then((temp_acc) => {
      acc = temp_acc;
      $("#upload_button").prop("disabled", false);
      $("#message").empty();
      fade_in("alert-info", "Connected!", " Account: <br>" + acc);
    });
    setTimeout(function () {
      if (acc === null) {
        $("#upload_button").prop("disabled", true);
        $("#message").empty();
        fade_in(
          "alert-warning",
          "Warning!",
          " Account is locked. Upload access is disabled."
        );
      }
    }, 500);
  }
});

function hash_file(file, callback) {
  var fr = new FileReader();
  fr.readAsArrayBuffer(file);
  fr.onload = function (e) {
    var temp = CryptoJS.lib.WordArray.create(fr.result);
    var hash = "0x" + CryptoJS.SHA256(temp).toString();
    callback(file.name, hash);
  };
}
//calls function in smart contract
function upload_to_blockchain(hash, callback) {
  contract.methods.upload(hash).send(
    {
      from: acc,
    },
    function (error, tx) {
      if (error) fade_in("alert-danger", "Error!", " Please try again.");
      else callback(tx);
    }
  );
}
//calls function in smart contract
function verify(hash, callback) {
  contract.methods.verify(hash).call(function (error, result) {
    if (!error) {
      let resultObj = {
        timestamp: new Date(result[0] * 1000),
        block_number: result[1],
      };
      callback(resultObj);
    } else callback(null);
  });
}
//Get account in MetaMask
async function getAccount() {
  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts[0];
}

function fade_in(special_class, message1, message2) {
  $("#message").fadeOut("fast", function () {
    $(this).append(
      "<div class='alert " +
        special_class +
        "'> <b>" +
        message1 +
        "</b>" +
        message2 +
        "</div>"
    );
    $(this).fadeIn("fast");
  });
}

function get_filename(callback) {
  file_array = [];
  var fileInput = document.getElementById("file_input");
  if (fileInput.files.length !== 0) {
    callback(fileInput.files);
  }
}

function pull_up(callback) {
  $("h1").animate({
    top: "15%",
  });
  $(".upload").animate({
    top: "40%",
  });
  callback();
}

function pull_down(callback) {
  $("h1").animate({
    top: "20%",
  });
  $(".upload").animate({
    top: "50%",
  });
  callback();
}
