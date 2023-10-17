"use client"

import { Button, Card } from "@ensdomains/thorin"
// import lit from "/lib/lit"
import { ProviderType } from "@lit-protocol/constants"
import { BaseProvider, GoogleProvider } from "@lit-protocol/lit-auth-client"

export default function ViewContent() {
  return (
    <div className="px-96">
      <header className="text-center pt-4 pb-8 text-2xl">
        View your document
      </header>
      <Card>
        <Button>Sign in with Google</Button>
      </Card>
    </div>
  )
}
