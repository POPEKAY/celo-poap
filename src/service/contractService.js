import { ethers } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";
import CeloPoapAbi from "../abis/CeloPoap.json";


const getContract = async () => {

    if(!window.ethereum) return;

    const contract = new ethers.Contract(
        CeloPoapAbi.address,
        CeloPoapAbi.abi,
        new ethers.providers.Web3Provider(window.ethereum)
    );

    return contract;
}

export const createACollection = async (signer, {code, maxMint, secondsToExpire, uri} = {}) => {
    
    const codeHash = ethers.utils.keccak256(toUtf8Bytes(code));
    
    const contract = await getContract();

    const txn = await contract.connect(signer).createToken(maxMint, secondsToExpire, codeHash, uri);

    return await txn.wait();
}

export const claimToken = async (signer,{ index, code} = {}) => {
    const contract = (await getContract()).connect(signer);

    const txn = (index > 0) ?  
        await contract.claimToken( index,code) : 
        await contract.claimTokenByCode(code);

    return await txn.wait();
}

export const getCollections = async (address) => {
    const contract = await getContract();

    const NFTLength = await contract.collectionsOf(address);

    const nfts = [];
    for (let i = 0; i < NFTLength; i++) {
        const nft = new Promise(async (resolve) => {
            try {
                const [uri, index, maxMint, minted] = await contract.createdCollection(address, i);
                
                const metadata = await getNFTData(uri);
                
                resolve({ ...metadata, collectionIndex: index, maxMint, minted });
            } catch (error) {
                console.log(error);
                resolve(null);
            }
        });

        nfts.push(nft);
    }

    const results = await Promise.all(nfts);

    return results;
}

export const getMintedCollections = async (address) => {
    const contract = await getContract();

    const NFTLength = await contract.balanceOf(address);

    const nfts = [];
    for (let i = 0; i < NFTLength; i++) {
        const nft = new Promise(async (resolve) => {
            try {
                const tokenIndex = await contract.tokenOfOwnerByIndex(address, i);

                const uri = await contract.tokenURI(tokenIndex);
                
                const metadata = await getNFTData(uri);
                
                resolve({ ...metadata });
            } catch (error) {
                console.log(error);
                resolve(null);
            }
        });

        nfts.push(nft);
    }

    const results = await Promise.all(nfts);

    return results;
}

export async function getTokenURI(contract, tokenId) {
    return await contract.tokenURI(tokenId);
}

async function totalCollections(address) {
    const contract = await getContract();
    
    const collectionCount =  await contract.collectionsOf(address);

    return collectionCount;
}

//fetch data from ipfs
export const getNFTData = async (url) => {
    if (!url) {
        return null;
    }
    const [,token] = url.split("//");
    
        const response = await fetch(`https://ipfs.io/ipfs/${token}`, {
            method: "GET",
        });

        return await response.json();
};