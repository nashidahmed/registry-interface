import {
  GoogleProvider,
  LitAuthClient,
  BaseProvider,
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
import { SmartAccountSigner, WalletClientSigner } from "@alchemy/aa-core"
import { createWalletClient, custom } from "viem"
import {
  LitAbility,
  LitAccessControlConditionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers"

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
    resource: new LitPKPResource("*"),
    ability: LitAbility.PKPSigning,
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
 * Get auth method object from redirect
 */
export async function claimKey(
  authMethod: AuthMethod
): Promise<ClaimKeyResponse> {
  await litNodeClient.connect()

  let claimReq = {
    authMethod,
    relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
  }

  const res: ClaimKeyResponse = await litNodeClient.claimKeyId(claimReq)
  console.log(res)
  return res
}

export async function computeKey(sub: string) {
  await litNodeClient.connect()
  const keyId = litNodeClient.computeHDKeyId(
    sub,
    process.env.NEXT_PUBLIC_GOOGLE_APP_ID as string
  )
  console.log(keyId)
  // the key id can now be given to the public key calculation method
  const publicKey = litNodeClient.computeHDPubKey(keyId.slice(2))
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

/**
 * Get provider for given auth method
 */
function getProviderByAuthMethod(authMethod: AuthMethod) {
  switch (authMethod.authMethodType) {
    case AuthMethodType.GoogleJwt:
      return litAuthClient.getProvider(ProviderType.Google) as BaseProvider
    default:
      return
  }
}
// export async encryptFile(file: File, web3Provider, walletAddress) {

//   await litNodeClient.connect()

//   const authSig = await ethConnect.signAndSaveAuthMessage({
//     web3: web3Provider,
//     account: walletAddress.toLowerCase(),
//     chainId: 5,
//     expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
//   })
//   const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({ file })

//   const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
//     accessControlConditions,
//     symmetricKey,
//     authSig,
//     chain,
//   })

//   return {
//     encryptedFile,
//     encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
//       encryptedSymmetricKey,
//       "base16"
//     ),
//   }
// }
