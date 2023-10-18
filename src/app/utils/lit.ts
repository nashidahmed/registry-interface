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

class Lit {
  private DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "localhost"
  public ORIGIN =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
      ? `https://${this.DOMAIN}`
      : `http://${this.DOMAIN}:3000`
  private litAuthClient: LitAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
    },
  })

  private litNodeClient = this.litAuthClient.litNodeClient

  constructor() {
    this.litNodeClient.connect()
  }

  /**
   * Redirect to Lit login
   */
  async signInWithGoogle(redirectUri: string): Promise<void> {
    const googleProvider = this.litAuthClient.initProvider<GoogleProvider>(
      ProviderType.Google,
      { redirectUri }
    )
    await googleProvider.signIn()
  }

  /**
   * Get auth method object from redirect
   */
  async authenticateWithGoogle(
    redirectUri: string
  ): Promise<AuthMethod | undefined> {
    const googleProvider = this.litAuthClient.initProvider<GoogleProvider>(
      ProviderType.Google,
      { redirectUri }
    )
    const authMethod = await googleProvider.authenticate()
    return authMethod
  }

  /**
   * Get auth method object from redirect
   */
  async claimKey(authMethod: AuthMethod): Promise<ClaimKeyResponse> {
    let claimReq = {
      authMethod,
      relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
    }

    const res: ClaimKeyResponse = await this.litNodeClient.claimKeyId(claimReq)
    console.log(res)
    return res
  }

  async computeKey() {
    const keyId = this.litNodeClient.computeHDKeyId(
      "demon.king.115@gmail.com",
      process.env.NEXT_PUBLIC_GOOGLE_APP_ID as string
    )
    console.log(keyId)
    // the key id can now be given to the public key calculation method
    const publicKey = this.litNodeClient.computeHDPubKey(keyId.slice(2))
    console.log("user public key will be: ", publicKey)
  }

  /**
   * Generate session sigs for given params
   */
  async getSessionSigs({
    pkpPublicKey,
    authMethod,
    sessionSigsParams,
  }: {
    pkpPublicKey: string
    authMethod: AuthMethod
    sessionSigsParams: GetSessionSigsProps
  }): Promise<SessionSigs> {
    const provider = this.getProviderByAuthMethod(authMethod)
    // console.log(provider?.computePublicKeyFromAuthMethod(authMethod))
    if (provider) {
      // await litNodeClient.connect()
      const sessionSigs = await provider.getSessionSigs({
        pkpPublicKey,
        authMethod,
        sessionSigsParams,
        litNodeClient: this.litNodeClient,
      })
      console.log(sessionSigs)

      return sessionSigs
    } else {
      throw new Error(
        `Provider not found for auth method type ${authMethod.authMethodType}`
      )
    }
  }

  async updateSessionSigs(params: GetSessionSigsProps): Promise<SessionSigs> {
    const sessionSigs = await this.litNodeClient.getSessionSigs(params)
    return sessionSigs
  }

  /**
   * Fetch PKPs associated with given auth method
   */
  async getPKPs(authMethod: AuthMethod): Promise<IRelayPKP[]> {
    const provider = this.getProviderByAuthMethod(authMethod) as BaseProvider
    const allPKPs = await provider.fetchPKPsThroughRelayer(authMethod)
    return allPKPs
  }

  /**
   * Mint a new PKP for current auth method
   */
  async mintPKP(authMethod: AuthMethod): Promise<IRelayPKP> {
    const provider = this.getProviderByAuthMethod(authMethod) as BaseProvider

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
  getProviderByAuthMethod(authMethod: AuthMethod) {
    switch (authMethod.authMethodType) {
      case AuthMethodType.GoogleJwt:
        return this.litAuthClient.getProvider(
          ProviderType.Google
        ) as BaseProvider
      case AuthMethodType.EthWallet:
        return this.litAuthClient.getProvider(
          ProviderType.EthWallet
        ) as BaseProvider
      default:
        return
    }
  }
}

export default new Lit()
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
