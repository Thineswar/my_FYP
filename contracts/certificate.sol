pragma solidity ^0.4.4;

contract Certificate {
    struct Cert {
        uint timestamp;
        uint block_number;
    }

    mapping (bytes32 => Cert) private docHashes;

    function Certificate() public {
        // constructor
    }

    function upload (bytes32 file_hash) public {
        Cert memory new_Cert = Cert(now, block.number);
        docHashes[file_hash] = new_Cert;
    }

    function verify (bytes32 file_hash) public constant returns(uint, uint) {
        return (docHashes[file_hash].timestamp, docHashes[file_hash].block_number);
    }
}