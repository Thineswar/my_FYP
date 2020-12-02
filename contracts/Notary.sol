pragma solidity ^0.4.4;

contract certificate {
    struct Record {
        uint timestamp;
        uint block_number;
    }

    mapping (bytes32 => Record) private docHashes;

    function Notary() public {
        // constructor
    }

    function addDocHash (bytes32 hash) public {
        Record memory newRecord = Record(now, block.number);
        docHashes[hash] = newRecord;
    }

    function findDocHash (bytes32 hash) public constant returns(uint, uint) {
        return (docHashes[hash].timestamp, docHashes[hash].block_number);
    }
}