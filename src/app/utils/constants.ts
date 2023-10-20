export const SISMO_RES = "sismo-response"
export const LIT_ACCOUNT = "lit-account"
export const LIT_AUTH_METHOD = "lit-auth-method"
export const PKP_WALLET = "pkp-wallet"

export const DEFAULT_CHAIN_ID = 80001
export const CHAINS = [
  {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    type: "ERC1155",
    rpcUrls: [
      "https://eth-mainnet.alchemyapi.io/v2/EuGnkVlzVoEkzdg0lpCarhm8YHOxWVxE",
    ],
    blockExplorerUrls: ["https://etherscan.io"],
    vmType: "EVM",
    testNetwork: false,
  },
  {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC",
    decimals: 18,
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://explorer.matic.network"],
    type: "ERC1155",
    vmType: "EVM",
    testNetwork: false,
  },
  {
    chainId: 42161,
    name: "Arbitrum",
    symbol: "AETH",
    decimals: 18,
    type: "ERC1155",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io/"],
    vmType: "EVM",
    testNetwork: false,
  },
  {
    chainId: 80001,
    name: "Mumbai",
    symbol: "MATIC",
    decimals: 18,
    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"],
    type: "ERC1155",
    vmType: "EVM",
    testNetwork: true,
  },
  {
    chainId: 5,
    name: "Goerli",
    symbol: "ETH",
    decimals: 18,
    rpcUrls: [
      "https://eth-goerli.g.alchemy.com/v2/KRnJnphdws3ycVi3v0t9UmGSz8AIrnFA",
    ],
    blockExplorerUrls: ["https://goerli.etherscan.io"],
    type: "ERC1155",
    vmType: "EVM",
    testNetwork: true,
  },
]

// export const AuthMethodTypes = {
//   NULLMETHOD: 0,
//   ADDRESS: 1,
//   ACTION: 2,
//   WEBAUTHN: 3,
//   DISCORD: 4,
//   GOOGLE: 5,
//   GOOGLE_JWT: 6,
// };
