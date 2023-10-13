import * as LitJsSdk from "@lit-protocol/lit-node-client"
import { ethConnect } from "@lit-protocol/auth-browser"
import { LitAuthClient } from "@lit-protocol/lit-auth-client"
import { ProviderType } from "@lit-protocol/constants"

const STYTCH_PROJECT_ID: string = process.env
  .NEXT_PUBLIC_STYTCH_PROJECT_ID as string
const STYTCH_SECRET: string = process.env.NEXT_PUBLIC_STYTCH_SECRET as string
const LIT_RELAY_API_KEY: string = process.env
  .NEXT_PUBLIC_LIT_RELAY_API_KEY as string

if (!STYTCH_PROJECT_ID || !STYTCH_SECRET) {
  throw Error("Could not find stytch project secret or id in enviorment")
}

// const client = new stytch.Client({
//   project_id: STYTCH_PROJECT_ID,
//   secret: STYTCH_SECRET,
// })

const litClient = new LitJsSdk.LitNodeClient({
  litNetwork: "cayenne",
  debug: false,
})
const chain = "mumbai"

// Set up LitAuthClient
const litAuthClient = new LitAuthClient({
  litRelayConfig: {
    // Request a Lit Relay Server API key here: https://forms.gle/RNZYtGYTY9BcD9MEA
    relayApiKey: LIT_RELAY_API_KEY,
  },
})

// Initialize Google provider
litAuthClient.initProvider(ProviderType.Google, {
  // The URL of your web app where users will be redirected after authentication
  redirectUri: "http://localhost:3000/view",
})

class Lit {
  private litNodeClient: LitJsSdk.LitNodeClient
  private authClient: LitAuthClient

  constructor() {
    console.log("Entered here")
    this.connect()
    this.litNodeClient = litClient
    this.authClient = litAuthClient
  }

  async connect() {
    await litClient.connect()
  }

  encryptFile(userId: string) {
    // if (!this.litNodeClient) {
    //   await this.connect()
    // }

    console.log(this.litNodeClient)
    console.log(userId)
    const keyId = this.litNodeClient.computeHDKeyId(userId, STYTCH_PROJECT_ID)
    // the key id can now be given to the public key calculation method
    const publicKey = this.litNodeClient.computeHDPubKey(keyId)
    console.log("user public key will be: ", publicKey)

    // const authSig = await ethConnect.signAndSaveAuthMessage({
    //   web3: web3Provider,
    //   account: walletAddress.toLowerCase(),
    //   chainId: 5,
    //   expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    // })
    // const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({ file })

    // const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
    //   accessControlConditions,
    //   symmetricKey,
    //   authSig,
    //   chain,
    // })

    // return {
    //   encryptedFile,
    //   encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
    //     encryptedSymmetricKey,
    //     "base16"
    //   ),
    // }
  }
}

export default new Lit()
