require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

console.log(process.env.REACT_APP_ALFAJORES_RPC);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    alfajores: {
      url: process.env.REACT_APP_ALFAJORES_RPC,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY]

    }
  }
};
