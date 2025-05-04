// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is ERC721, ReentrancyGuard, Ownable {
    struct Land {
        string surveyNumber;
        string location;
        uint256 area;
        uint256 value;
        address owner;
        bool isVerified;
        string latitude;
        string longitude;
    }

    mapping(uint256 => Land) public lands;
    mapping(string => bool) public surveyNumberExists;
    uint256 private _tokenIds;

    event LandRegistered(
        uint256 indexed tokenId,
        string surveyNumber,
        address indexed owner
    );
    event LandTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );
    event LandVerified(uint256 indexed tokenId);

    constructor() ERC721("LandRegistry", "LAND") {}

    function registerLand(
        string memory surveyNumber,
        string memory location,
        uint256 area,
        uint256 value,
        string memory latitude,
        string memory longitude
    ) public payable nonReentrant returns (uint256) {
        require(!surveyNumberExists[surveyNumber], "Survey number already exists");
        require(msg.value >= value, "Insufficient payment");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        lands[newTokenId] = Land({
            surveyNumber: surveyNumber,
            location: location,
            area: area,
            value: value,
            owner: msg.sender,
            isVerified: false,
            latitude: latitude,
            longitude: longitude
        });

        surveyNumberExists[surveyNumber] = true;
        _safeMint(msg.sender, newTokenId);

        emit LandRegistered(newTokenId, surveyNumber, msg.sender);
        return newTokenId;
    }

    function verifyLand(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Land does not exist");
        require(!lands[tokenId].isVerified, "Land already verified");

        lands[tokenId].isVerified = true;
        emit LandVerified(tokenId);
    }

    function transferLand(
        address to,
        uint256 tokenId
    ) public payable nonReentrant {
        require(_exists(tokenId), "Land does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(lands[tokenId].isVerified, "Land not verified");
        require(msg.value >= lands[tokenId].value, "Insufficient payment");

        address previousOwner = ownerOf(tokenId);
        _transfer(previousOwner, to, tokenId);
        lands[tokenId].owner = to;

        // Transfer the payment to the previous owner
        payable(previousOwner).transfer(msg.value);

        emit LandTransferred(tokenId, previousOwner, to);
    }

    function getLand(uint256 tokenId) public view returns (Land memory) {
        require(_exists(tokenId), "Land does not exist");
        return lands[tokenId];
    }

    function updateLandValue(uint256 tokenId, uint256 newValue) public {
        require(_exists(tokenId), "Land does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        lands[tokenId].value = newValue;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 