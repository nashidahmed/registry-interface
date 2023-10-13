import * as LitJsSdk from "@lit-protocol/lit-node-client"
import { ethConnect } from "@lit-protocol/auth-browser"

const litClient = new LitJsSdk.LitNodeClient({
  litNetwork: "cayenne",
  debug: false,
})
const chain = "mumbai"

class Lit {
  private litNodeClient: LitJsSdk.LitNodeClient

  constructor() {
    this.connect()
    this.litNodeClient = litClient
  }

  async connect() {
    await litClient.connect()
  }
}
