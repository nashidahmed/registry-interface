import {
  GoogleProvider,
  EthWalletProvider,
  LitAuthClient,
  BaseProvider,
} from "@lit-protocol/lit-auth-client"
import { AuthMethodType, ProviderType } from "@lit-protocol/constants"
import {
  AuthMethod,
  GetSessionSigsProps,
  IRelayPKP,
  ProviderOptions,
  SessionSigs,
  ClaimRequest,
  ClaimKeyResponse,
} from "@lit-protocol/types"
import * as jose from "jose"
import { ethers } from "ethers"

export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "localhost"
export const ORIGIN =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://${DOMAIN}`
    : `http://${DOMAIN}:3000`

export const litAuthClient: LitAuthClient = new LitAuthClient({
  litRelayConfig: {
    relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
  },
})

export const litNodeClient = litAuthClient.litNodeClient

/**
 * Redirect to Lit login
 */
export async function signInWithGoogle(redirectUri: string): Promise<void> {
  const googleProvider = litAuthClient.initProvider<GoogleProvider>(
    ProviderType.Google,
    { redirectUri }
  )
  await googleProvider.signIn()
}

/**
 * Get auth method object from redirect
 */
export async function authenticateWithGoogle(
  redirectUri: string
): Promise<AuthMethod | undefined> {
  const googleProvider = litAuthClient.initProvider<GoogleProvider>(
    ProviderType.Google,
    { redirectUri }
  )
  const authMethod = await googleProvider.authenticate()
  return authMethod
}

/**
 * Get auth method object from redirect
 */
export async function authenticate(token: string): Promise<ClaimKeyResponse> {
  // const tokenPayload = jose.decodeJwt(authMethod.accessToken)
  // const userId: string = tokenPayload["sub"] as string
  // const audience: string = tokenPayload["aud"] as string
  // const authMethodId = ethers.utils.keccak256(
  //   ethers.utils.toUtf8Bytes(`${userId}:${audience}`)
  // )

  // session.claimKeyId()

  await litNodeClient.connect()

  // const session = litAuthClient.initProvider<GoogleProvider>(
  //   ProviderType.Google,
  //   {
  //     appId:
  //       "355007986731-llbjq5kbsg8ieb705mo64nfnh88dhlmn.apps.googleusercontent.com",
  //     userId: "108320763296956109044",
  //   }
  // )
  let authMethod: AuthMethod = {
    authMethodType: AuthMethodType.GoogleJwt, // also AuthMethodType.GoogleJwt is same result
    accessToken: token,
  }

  let claimReq = {
    authMethod,
    relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
  }

  const res: ClaimKeyResponse = await litNodeClient.claimKeyId(claimReq)
  console.log(res)
  return res
}

export async function computeKey() {
  await litNodeClient.connect()
  // const session = litAuthClient.initProvider<GoogleProvider>(
  //   ProviderType.Google,
  //   {
  //     userId: "108320763296956109044",
  //     appId:
  //       "355007986731-llbjq5kbsg8ieb705mo64nfnh88dhlmn.apps.googleusercontent.com",
  //   }
  // )

  const keyId = litNodeClient.computeHDKeyId(
    "108320763296956109044",
    "355007986731-llbjq5kbsg8ieb705mo64nfnh88dhlmn.apps.googleusercontent.com"
  )
  console.log(keyId)
  // the key id can now be given to the public key calculation method
  const publicKey = litNodeClient.computeHDPubKey(keyId)
  console.log("user public key will be: ", publicKey)
}

/**
 * Generate session sigs for given params
 */
export async function getSessionSigs({
  pkpPublicKey,
  authMethod,
  sessionSigsParams,
}: {
  pkpPublicKey: string
  authMethod: AuthMethod
  sessionSigsParams: GetSessionSigsProps
}): Promise<SessionSigs> {
  const provider = getProviderByAuthMethod(authMethod)
  console.log(provider)
  if (provider) {
    const sessionSigs = await provider.getSessionSigs({
      pkpPublicKey,
      authMethod,
      sessionSigsParams,
    })
    console.log(sessionSigs)

    return sessionSigs
  } else {
    throw new Error(
      `Provider not found for auth method type ${authMethod.authMethodType}`
    )
  }
}

export async function updateSessionSigs(
  params: GetSessionSigsProps
): Promise<SessionSigs> {
  const sessionSigs = await litNodeClient.getSessionSigs(params)
  return sessionSigs
}

/**
 * Fetch PKPs associated with given auth method
 */
export async function getPKPs(authMethod: AuthMethod): Promise<IRelayPKP[]> {
  const provider = getProviderByAuthMethod(authMethod) as BaseProvider
  const allPKPs = await provider.fetchPKPsThroughRelayer(authMethod)
  return allPKPs
}

/**
 * Mint a new PKP for current auth method
 */
export async function mintPKP(authMethod: AuthMethod): Promise<IRelayPKP> {
  const provider = getProviderByAuthMethod(authMethod) as BaseProvider

  let txHash: string

  // Mint PKP through relay server
  txHash = await provider.mintPKPThroughRelayer(authMethod)

  const response = await provider.relay.pollRequestUntilTerminalState(txHash)
  if (response.status !== "Succeeded") {
    throw new Error("Minting failed")
  }
  const newPKP: IRelayPKP = {
    tokenId: response.pkpTokenId as string,
    publicKey: response.pkpPublicKey as string,
    ethAddress: response.pkpEthAddress as string,
  }
  return newPKP
}

/**
 * Get provider for given auth method
 */
function getProviderByAuthMethod(authMethod: AuthMethod) {
  switch (authMethod.authMethodType) {
    case AuthMethodType.GoogleJwt:
      return litAuthClient.getProvider(ProviderType.Google) as BaseProvider
    case AuthMethodType.EthWallet:
      return litAuthClient.getProvider(ProviderType.EthWallet) as BaseProvider
    default:
      return
  }
}
