import { Contract, ethers } from "ethers"
import { useState } from "react"
import biconomyForwarderAbi from "/public/abis/Biconomy.json"
import abi from "ethereumjs-abi"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"

export interface ICreateIssuerRequest {
  responseBytes: string
  name: string
  website: string
  image: string
  desc: string
}

interface ISignRequest {
  from: string
  to: string
  token: string
  txGas: number
  tokenGasPrice: string
  batchId: number
  batchNonce: number
  deadline: number
  data: string
}

const baseURL = "https://api.biconomy.io"
const networkId = 80001
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const theRegistryContract = process.env
  .NEXT_PUBLIC_THE_REGISTRY_CONTRACT_ADDRESS as string

export default function useBiconomy() {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()
  const [txHash, settxHash] = useState<string>()

  // pass the networkId to get contract addresses
  const getContractAddresses = async () => {
    let contractAddresses = {
      biconomyForwarderAddress: "",
    }
    const apiInfo = `${baseURL}/api/v2/meta-tx/systemInfo?networkId=${networkId}`
    const response = await fetch(apiInfo)
    const systemInfo = await response.json()
    contractAddresses.biconomyForwarderAddress =
      systemInfo.biconomyForwarderAddress
    return contractAddresses
  }

  /**
   * Returns ABI and contract address based on network Id
   * You can build biconomy forwarder contract object using above values and calculate the nonce
   * @param {*} networkId
   */
  const getBiconomyForwarderConfig = async () => {
    //get trusted forwarder contract address from network id
    const contractAddresses = await getContractAddresses()
    const forwarderAddress = contractAddresses.biconomyForwarderAddress
    return {
      abi: biconomyForwarderAbi,
      address: forwarderAddress,
    }
  }

  /**
   * pass the below params in any order e.g. account=<account>,batchNone=<batchNone>,...
   * @param {*}  account - from (end user's) address for this transaction
   * @param {*}  to - target recipient contract address
   * @param {*}  gasLimitNum - gas estimation of your target method in numeric format
   * @param {*}  batchId - batchId
   * @param {*}  batchNonce - batchNonce which can be verified and obtained from the biconomy forwarder
   * @param {*}  data - functionSignature of target method
   * @param {*}  deadline - optional deadline for this forward request
   */
  const buildForwardTxRequest = (
    account: string,
    to: string,
    gasLimitNum: number,
    batchId: string,
    batchNonce: string,
    data: string,
    deadline?: number
  ): ISignRequest => {
    return {
      from: account,
      to: to,
      token: ZERO_ADDRESS,
      txGas: gasLimitNum,
      tokenGasPrice: "0",
      batchId: parseInt(batchId),
      batchNonce: parseInt(batchNonce),
      deadline: deadline || Math.floor(Date.now() / 1000 + 3600),
      data,
    }
  }

  /**
   * pass your forward request
   * use this method to build message to be signed by end user in personal signature format
   * @param {*} networkId
   */
  const getDataToSignForPersonalSign = (request: ISignRequest) => {
    const hashToSign = abi.soliditySHA3(
      [
        "address",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
      ],
      [
        request.from,
        request.to,
        request.token,
        request.txGas,
        request.tokenGasPrice,
        request.batchId,
        request.batchNonce,
        request.deadline,
        ethers.utils.keccak256(request.data),
      ]
    )
    return hashToSign
  }

  const submitWithPersonalSign = async (
    // data: ICreateIssuerRequest,
    functionSignature: string,
    pkpWallet: PKPEthersWallet,
    apiId: string
  ) => {
    setLoading(true)
    setError(undefined)
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_INFURA_RPC
    )

    // const signer = this.walletProvider.getSigner()
    const signer = pkpWallet
    let gasPrice = await provider.getGasPrice()
    let gasLimit = await provider.estimateGas({
      to: theRegistryContract,
      from: pkpWallet.address,
      data: functionSignature,
    })

    let forwarder = await getBiconomyForwarderConfig()
    let forwarderContract = new Contract(
      forwarder.address,
      forwarder.abi,
      new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY as string, provider)
    )

    const batchNonce = await forwarderContract.getNonce(pkpWallet.address, 0)
    // const batchId = await forwarderContract.getBatch(userAddress)

    const to = theRegistryContract
    const gasLimitNum = Number(gasLimit.toNumber().toString())
    const request = buildForwardTxRequest(
      pkpWallet.address,
      to,
      gasLimitNum,
      "0",
      batchNonce,
      functionSignature
    )

    const dataToSign = getDataToSignForPersonalSign(request)

    signer
      .signMessage(dataToSign)
      .then(async (sig) => {
        await sendTransaction(
          pkpWallet.address,
          request,
          sig,
          "PERSONAL_SIGN",
          apiId
        )
      })
      .catch(function (err) {
        setError(err as Error)
        setLoading(false)
      })
  }

  const sendTransaction = async (
    from: string,
    request: ISignRequest,
    sig: string,
    signatureType: string,
    apiId: string
  ) => {
    setError(undefined)
    let params = [request, sig]
    fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
      method: "POST",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_BICONOMY_API_KEY as string,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        to: theRegistryContract,
        apiId,
        params,
        from,
        signatureType,
      }),
    })
      .then((response) => response.json())
      .then(async function (result) {
        settxHash(result.txHash)
      })
      .catch(function (err) {
        setError(err as Error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return {
    submitWithPersonalSign,
    loading,
    setLoading,
    txHash,
  }
}
