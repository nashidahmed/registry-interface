"use client"

import {
  AuthType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react"

import { createWeb3Modal } from "@web3modal/wagmi/react"
import { walletConnectProvider, EIP6963Connector } from "@web3modal/wagmi"

import { WagmiConfig, configureChains, createConfig } from "wagmi"
import { publicProvider } from "wagmi/providers/public"
import { mainnet } from "wagmi/chains"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string

// 2. Create wagmiConfig
const { chains, publicClient } = configureChains(
  [mainnet],
  [walletConnectProvider({ projectId }), publicProvider()]
)

const appData = {
  name: "Docissue",
  description: "Web3 Document Issuer/Viewer",
}

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false, metadata: appData },
    }),
    new EIP6963Connector({ chains }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({
      chains,
      options: { appName: appData.name },
    }),
  ],
  publicClient,
})

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains, themeMode: "light" })

export default function Home() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <main>
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
    </WagmiConfig>
  )
}
