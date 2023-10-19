import { Contract, ethers } from "ethers"
import { useState } from "react"
import biconomyForwarderAbi from "/public/abis/Biconomy.json"
import abi from "ethereumjs-abi"

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
const docissueContract = process.env
  .NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as string

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
    userAddress: string
  ) => {
    setLoading(true)
    setError(undefined)
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_INFURA_RPC
    )

    // const signer = this.walletProvider.getSigner()
    const signer = new ethers.Wallet(
      process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
      provider
    )
    let gasPrice = await provider.getGasPrice()
    let gasLimit = await provider.estimateGas({
      to: docissueContract,
      from: userAddress,
      data: functionSignature,
    })

    let forwarder = await getBiconomyForwarderConfig()
    let forwarderContract = new Contract(
      forwarder.address,
      forwarder.abi,
      signer
    )

    console.log("------------1-------------")
    const batchNonce = await forwarderContract.getNonce(userAddress, 0)
    console.log("------------2-------------")
    // const batchId = await forwarderContract.getBatch(userAddress)

    const to = docissueContract
    const gasLimitNum = Number(gasLimit.toNumber().toString())
    const request = buildForwardTxRequest(
      userAddress,
      to,
      gasLimitNum,
      "0",
      batchNonce,
      functionSignature
    )
    console.log("------------2-------------")

    const dataToSign = getDataToSignForPersonalSign(request)

    console.log(dataToSign)

    signer
      .signMessage(dataToSign)
      .then(async (sig) => {
        await sendTransaction(userAddress, request, sig, "PERSONAL_SIGN")
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
    signatureType: string
  ) => {
    setError(undefined)
    let params = [request, sig]
    console.log(
      JSON.stringify({
        to: docissueContract,
        apiId: process.env.NEXT_PUBLIC_BICONOMY_API_ID as string,
        params,
        from,
        signatureType,
      })
    )
    fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
      method: "POST",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_BICONOMY_API_KEY as string,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        to: docissueContract,
        apiId: process.env.NEXT_PUBLIC_BICONOMY_API_ID as string,
        params,
        from,
        signatureType,
      }),
    })
      .then((response) => response.json())
      .then(async function (result) {
        console.log(result)
        console.log(`Transaction sent by relayer with hash ${result.txHash}`)
        settxHash(result.txHash)
      })
      .catch(function (err) {
        setError(err as Error)
        console.log(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return {
    submitWithPersonalSign,
    loading,
    txHash,
  }
}