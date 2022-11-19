// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CeloPOAP
 * A permissionless smart contract for creating and air dropping NFTs
 */
contract CeloPoap is ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter _tokenIdCounter;
    Counters.Counter _collectionCounter;

    // tracks a collection to a given code
    mapping(uint => bytes32) public codeOfCollection;

    // tracks a code token to a collection
    mapping(bytes32 => uint) public collectionOfCode;

    // tracks the maximum number of mints for a given code
    mapping(uint => uint) public maxMint;

    // tracks the number of minted tokens per code
    mapping(uint => uint) public minted;

    // tacks collection mints of address;
    mapping(address => mapping(uint => bool)) mints;

    // tracks the time when a given code expires
    mapping(uint => uint) public expireTime;

    // all collections
    mapping(uint => string) public collections;

    // tracks owners of collections
    mapping(address => mapping(uint => uint)) public ownerOfcollection;

    // track collection count of creators
    mapping(address => uint) public collectionsOf;

    modifier _isValidCode(bytes32 _code) {
        uint collectionIndex = collectionOfCode[_code];
        require(collectionIndex > 0, "Invalid token code");
        require(
            expireTime[collectionIndex] > block.timestamp,
            "Code has expired"
        );
        _;
    }

    modifier _canMint(bytes32 _code) {
        uint collectionIndex = collectionOfCode[_code];
        require(
            maxMint[collectionIndex] > minted[collectionIndex],
            "Maximum mint reached"
        );
        _;
    }

    event TokenCreated(
        address indexed owner,
        uint indexed collectionIndex,
        uint _maxMint,
        uint _secondsToExpire,
        string _uri
    );

    event TokenMinted(
        uint indexed tokenId,
        uint indexed collectionIndex,
        address indexed _address
    );

    constructor(string memory tokenName, string memory tokenSymbol)
        ERC721(tokenName, tokenSymbol)
    {}

    /**
     * @dev creates a token that can be minted with code.
     * @param _maxMint maximum number of tokens that can be minted
     * @param _secondsToExpire time after which `code` expires
     * @param code code used to mint NFT
     * @param _uri uri of token when minted.
     */
    function createToken(
        uint _maxMint,
        uint _secondsToExpire,
        bytes32 code,
        string memory _uri
    ) external {
        _collectionCounter.increment();

        uint collectionIndex = _collectionCounter.current();
        codeOfCollection[collectionIndex] = code;
        collectionOfCode[code] = collectionIndex;
        maxMint[collectionIndex] = _maxMint;
        expireTime[collectionIndex] = block.timestamp + _secondsToExpire;
        collections[collectionIndex] = _uri;
        ownerOfcollection[msg.sender][
            collectionsOf[msg.sender]
        ] = collectionIndex;
        collectionsOf[msg.sender] += 1;

        emit TokenCreated(
            msg.sender,
            collectionIndex,
            _maxMint,
            _secondsToExpire,
            _uri
        );
    }

    /**
     * @dev allows a user to mint a specific token based on code
     * @param code selects the token to be minted.
     */
    function claimToken(uint collectionIndex, bytes32 code)
        external
        _isValidCode(code)
        _canMint(code)
    {
        require(
            collectionIndex != 0 &&
                collectionIndex <= _collectionCounter.current(),
            "Collection does not exist"
        );
        require(
            !mints[msg.sender][collectionIndex],
            "You have already minted a token from this collection"
        );

        uint tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        string memory _uri = collections[collectionIndex];

        minted[collectionIndex] += 1;

        mints[msg.sender][collectionIndex] = true;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);

        emit TokenMinted(tokenId, collectionIndex, msg.sender);
    }

    function claimTokenByCode(bytes32 code)
        external
        _isValidCode(code)
        _canMint(code)
    {
        uint collectionIndex = collectionOfCode[code];
        require(
            !mints[msg.sender][collectionIndex],
            "You have already minted a token from this collection"
        );
        _tokenIdCounter.increment();
        uint tokenId = _tokenIdCounter.current();

        string memory _uri = collections[collectionIndex];

        minted[collectionIndex] += 1;

        mints[msg.sender][collectionIndex] = true;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);

        emit TokenMinted(tokenId, collectionIndex, msg.sender);
    }

    function collectionInfo(uint collectionIndex)
        public
        view
        returns (
            string memory,
            uint,
            uint,
            uint
        )
    {
        require(
            collectionIndex <= _collectionCounter.current(),
            "Invalid index"
        );

        return (
            collections[collectionIndex],
            collectionIndex,
            maxMint[collectionIndex],
            minted[collectionIndex]
        );
    }

    function createdCollection(address _address, uint collectionIndex)
        public
        view
        returns (
            string memory,
            uint,
            uint,
            uint
        )
    {
        require(collectionIndex <= collectionsOf[_address], "Invalid index");

        uint index = ownerOfcollection[_address][collectionIndex];

        return (collections[index], index, maxMint[index], minted[index]);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {ERC721-_burn}. This override additionally checks to see if a
     * token-specific URI was set for the token, and if so, it deletes the token URI from
     * the storage mapping.
     */
    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721URIStorage, ERC721)
    {
        super._burn(tokenId);
    }
}
