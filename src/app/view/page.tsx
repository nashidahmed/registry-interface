"use client"

import { Button, Card } from "@ensdomains/thorin"
import { Database } from "@tableland/sdk"
import lit from "/lib/lit"

export default function ViewContent() {
  // Begin login flow with Google
  async function authWithGoogle() {
    const provider = lit.authClient.getProvider(ProviderType.Google)
    await provider.signIn()
  }

  return (
    <div className="px-96">
      <header className="text-center pt-4 pb-8 text-2xl">
        View your document
      </header>
      <Card></Card>
    </div>
  )
}
