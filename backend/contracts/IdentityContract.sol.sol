// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

contract IdentityContract {
    struct User {
        uint256 id;
        address publicKey;
        string ipfsHash;
        string encryptedIpfsHash;
        bool userFlag;
        bool requesterFlag;
        string userPublicKey;
    }

    mapping(address => User) public users;
    mapping(string => address) public hashCheck;
    uint256 private userCounter;

    event UserRegistered(
        uint256 indexed userId,
        address indexed publicKey,
        string ipfsHash,
        string userPublicKey
    );
    event HashAssociated(address indexed userAddress, string hash);
    event EncryptedHashUpdated(address indexed user, string newHash);

    modifier onlyUser() {
        require(users[msg.sender].id != 0, " User not registered");
        _;
    }

    function registerUser(
        string memory _ipfsHash,
        string memory _userPublicKey
    ) public {
        require(users[msg.sender].id == 0, " User already registered");
        require(hashCheck[_ipfsHash] == address(0), " IPFS hash already used");

        userCounter++;
        users[msg.sender] = User({
            id: userCounter,
            publicKey: msg.sender,
            ipfsHash: _ipfsHash,
            encryptedIpfsHash: "",
            userFlag: true,
            requesterFlag: false,
            userPublicKey: _userPublicKey
        });

        hashCheck[_ipfsHash] = msg.sender;
        emit UserRegistered(userCounter, msg.sender, _ipfsHash, _userPublicKey);
    }

    function getUser(
        address _userAddress
    ) public view onlyUser returns (User memory) {
        return users[_userAddress];
    }

    function getUserIPFSHash() public view onlyUser returns (string memory) {
        return users[msg.sender].ipfsHash;
    }

    function setRequesterIpfsHash(
        string memory _encryptedIpfsHash
    ) public onlyUser {
        users[msg.sender].encryptedIpfsHash = _encryptedIpfsHash;
        emit EncryptedHashUpdated(msg.sender, _encryptedIpfsHash);
    }

    function checkHashOwner(string memory _hash) public view returns (address) {
        return hashCheck[_hash];
    }
}
