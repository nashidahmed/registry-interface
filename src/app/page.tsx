"use client"

import {
  AuthType,
  ClaimType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SismoConnectButton
        config={{
          appId: "0xf4977993e52606cfd67b7a1cde717069", // replace with your appId

          // displayRawResponse: true,
        }}
        // request proof of Data Sources ownership (e.g EVM, GitHub, twitter or telegram)
        auths={[{ authType: AuthType.TWITTER }]}
        // request message signature from users.
        signature={{ message: "I vote Yes to Privacy" }}
        // retrieve the Sismo Connect Reponse from the user's Sismo data vault
        onResponse={async (response: SismoConnectResponse) => {
          console.log(await response)
        }}
        // reponse in bytes to call a contract
        // onResponseBytes={async (response: string) => {
        //   console.log(response);
        // }}
      />
    </main>
  )
}
