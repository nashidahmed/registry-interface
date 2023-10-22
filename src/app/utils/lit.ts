import {
  GoogleProvider,
  LitAuthClient,
  BaseProvider,
  DiscordProvider,
} from "@lit-protocol/lit-auth-client"
import {
  AuthMethodType,
  LOCAL_STORAGE_KEYS,
  ProviderType,
} from "@lit-protocol/constants"
import {
  AuthMethod,
  GetSessionSigsProps,
  IRelayPKP,
  SessionSigs,
  ClaimKeyResponse,
  SessionKeyPair,
} from "@lit-protocol/types"
import {
  LitAbility,
  LitAccessControlConditionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers"
import { ethers } from "ethers"
import { toUtf8Bytes } from "ethers/lib/utils"
import {
  decryptToFile,
  decryptToString,
  encryptFile,
  encryptString,
} from "@lit-protocol/lit-node-client"
import * as jose from "jose"

const chain = "mumbai"
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

const resourceAbilities = [
  {
    resource: new LitAccessControlConditionResource("*"),
    ability: LitAbility.AccessControlConditionDecryption,
  },
]

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
 * Redirect to Lit login
 */
export async function signInWithDiscord(redirectUri: string): Promise<void> {
  const discordProvider = litAuthClient.initProvider<DiscordProvider>(
    ProviderType.Discord,
    { redirectUri }
  )
  await discordProvider.signIn()
}

/**
 * Get auth method object from redirect
 */
export async function authenticateWithDiscord(
  redirectUri: string
): Promise<AuthMethod | undefined> {
  const discordProvider = litAuthClient.initProvider<DiscordProvider>(
    ProviderType.Discord,
    { redirectUri }
  )
  const authMethod = await discordProvider.authenticate()
  return authMethod
}

/**
 * Get auth method object from redirect
 */
export async function claimKey(
  authMethod: AuthMethod
): Promise<ClaimKeyResponse | undefined> {
  await litNodeClient.connect()

  let claimReq = {
    authMethod,
    relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
  }

  try {
    const res: ClaimKeyResponse = await litNodeClient.claimKeyId(claimReq)
    return res
  } catch (err) {
    return
  }
}

export async function getDiscordAddress(sub: string): Promise<string> {
  await litNodeClient.connect()
  const keyId = litNodeClient.computeHDKeyId(
    sub,
    process.env.NEXT_PUBLIC_GOOGLE_APP_ID as string
  )

  const publicKey = litNodeClient.computeHDPubKey(keyId.slice(2))

  return ethers.utils.computeAddress(`0x${publicKey}`)
}

export async function getGoogleAddress(sub: string): Promise<string> {
  await litNodeClient.connect()
  const keyId = litNodeClient.computeHDKeyId(
    sub,
    process.env.NEXT_PUBLIC_GOOGLE_APP_ID as string
  )

  const publicKey = litNodeClient.computeHDPubKey(keyId.slice(2))

  return ethers.utils.computeAddress(`0x${publicKey}`)
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
  if (provider) {
    // await litNodeClient.connect()
    const sessionSigs = await provider.getSessionSigs({
      pkpPublicKey,
      authMethod,
      sessionSigsParams,
      litNodeClient: litNodeClient,
    })

    return sessionSigs
  } else {
    throw new Error(
      `Provider not found for auth method type ${authMethod.authMethodType}`
    )
  }
}

export async function signSessionKey() {
  const sessionKey: SessionKeyPair =
    typeof window !== "undefined"
      ? localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_KEY) &&
        JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_KEY) as string
        )
      : undefined
  const response = await litNodeClient.signSessionKey({
    sessionKey: sessionKey,
    authMethods: [],
    pkpPublicKey: sessionKey.publicKey,
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    resources: resourceAbilities,
    chainId: 1,
  })
  return response.authSig
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

export async function encryptDocument(
  file: File,
  sessionSigs: SessionSigs,
  receiver: string
) {
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain,
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: receiver.toLowerCase(),
      },
    },
  ]

  await litNodeClient.connect()

  const { ciphertext, dataToEncryptHash } = await encryptFile(
    { accessControlConditions, sessionSigs, file, chain },
    litNodeClient
  )

  return {
    ciphertext,
    dataToEncryptHash,
  }
}

export async function decryptDocument(
  ciphertext: string,
  dataToEncryptHash: string,
  sessionSigs: SessionSigs,
  receiver: string
) {
  await litNodeClient.connect()
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain,
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: receiver.toLowerCase(),
      },
    },
  ]

  const decryptedFile = await decryptToFile(
    {
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain,
      sessionSigs,
    },
    litNodeClient
  )
  // eslint-disable-next-line no-console
  return decryptedFile
}

export async function encryptEmail(
  authMethod: AuthMethod,
  sessionSigs: SessionSigs,
  receiver: string
) {
  const tokenPayload = jose.decodeJwt(authMethod.accessToken)
  const email = tokenPayload["email"] as string
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain,
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: receiver.toLowerCase(),
      },
    },
  ]

  await litNodeClient.connect()

  const { ciphertext, dataToEncryptHash } = await encryptString(
    { accessControlConditions, sessionSigs, chain, dataToEncrypt: email },
    litNodeClient
  )

  return {
    ciphertext,
    dataToEncryptHash,
  }
}

export async function decryptEmail(
  ciphertext: string,
  dataToEncryptHash: string,
  sessionSigs: SessionSigs,
  issuerAddress: string
) {
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain,
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: issuerAddress.toLowerCase(),
      },
    },
  ]

  await litNodeClient.connect()
  const decryptedEmail = await decryptToString(
    {
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain,
      sessionSigs,
    },
    litNodeClient
  )

  return decryptedEmail
}

/**
 * Get provider for given auth method
 */
function getProviderByAuthMethod(authMethod: AuthMethod) {
  switch (authMethod.authMethodType) {
    case AuthMethodType.GoogleJwt:
      return litAuthClient.getProvider(ProviderType.Google) as BaseProvider
    case AuthMethodType.Discord:
      return litAuthClient.getProvider(ProviderType.Discord)
    default:
      return
  }
}
