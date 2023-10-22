"use client"

import { Issuer } from "@/issuer/[id]/page"
import { WalletContext } from "@/layout"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { Database, Statement } from "@tableland/sdk"
import { ethers } from "ethers"
import Link from "next/link"
import { SetStateAction, useContext, useEffect, useState } from "react"
import theRegistryAbi from "/public/abis/TheRegistry.json"
import { AuthMethod, SessionSigs } from "@lit-protocol/types"
import { encryptEmail } from "@/utils/lit"
import useBiconomy from "@/hooks/useBiconomy"

const tableName: string = process.env.NEXT_PUBLIC_ISSUERS_TABLE_NAME as string // Our pre-defined health check table

export default function Issuers() {
  const { pkpWallet, authMethod, sessionSigs } = useContext<{
    pkpWallet?: PKPEthersWallet
    authMethod?: AuthMethod
    sessionSigs?: SessionSigs
    setPkpWallet?: React.Dispatch<SetStateAction<PKPEthersWallet>>
  }>(WalletContext)
  const [issuers, setIssuers] = useState<Issuer[]>()
  const [loadingIssuers, setLoadingIssuers] = useState<boolean>(true)
  const { submitWithPersonalSign, loading, txHash } = useBiconomy()
  const appId = "0x1002"
  const db = new Database()

  useEffect(() => {
    getIssuer()
  }, [])

  const getIssuer = async () => {
    try {
      const preparedStmt: Statement = db.prepare(
        `SELECT * FROM ${tableName} LIMIT 10`
      )

      const issuers: Issuer[] = (await preparedStmt.all()).results as Issuer[]
      setIssuers(issuers)
    } catch (err) {
      console.log(err)
    } finally {
      setLoadingIssuers(false)
    }
  }

  const getTwitterLink = (twitterId: string) => {
    let x = appId.length
    while (twitterId[x] == "0") x++

    return `https://twitter.com/i/user/${twitterId.slice(x)}`
  }

  const request = async (issuer: Issuer) => {
    if (authMethod && sessionSigs && pkpWallet) {
      const { ciphertext, dataToEncryptHash } = await encryptEmail(
        authMethod,
        sessionSigs,
        issuer.creator
      )

      let contractInterface = new ethers.utils.Interface(theRegistryAbi)
      let functionSignature = contractInterface.encodeFunctionData(
        "requestDocument",
        [dataToEncryptHash, ciphertext, `${issuer.id}`, pkpWallet.address]
      )

      submitWithPersonalSign(
        functionSignature,
        pkpWallet,
        process.env.NEXT_PUBLIC_BICONOMY_REQUEST_API_ID as string
      )
    }
  }

  return issuers && issuers.length !== 0 ? (
    <div className="w-full">
      <header className="h-24 flex items-center justify-center text-4xl">
        Registered Issuers
      </header>
      <div className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-2xl sm:p-6 md:p-8 flex flex-col gap-5 mx-auto">
        <table className="table-auto">
          <thead>
            <tr>
              <th>Name</th>
              <th>Website</th>
              <th>Details</th>
              <th>Verified Twitter</th>
              <th>Request document</th>
            </tr>
          </thead>
          <tbody>
            {issuers.map((issuer) => (
              <tr className="text-center" key={issuer.id}>
                <td>{issuer.name}</td>
                <td>
                  <Link
                    href={issuer.website}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    passHref
                    target="_blank"
                  >
                    {issuer?.website}
                  </Link>
                </td>
                <td>
                  <Link
                    href={`/issuer/${issuer.id}`}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    passHref
                  >
                    View details
                  </Link>
                </td>
                <td>
                  <Link
                    href={getTwitterLink(issuer.twitter)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    passHref
                    target="_blank"
                  >
                    Link
                  </Link>
                </td>

                <td>
                  <a
                    onClick={() => request(issuer)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                  >
                    Request {issuer.name}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="flex gap-2 justify-center mt-8">
          Requesting document
          <div>
            <div className="loader w-5 h-5"></div>
          </div>
        </div>
      )}
      {txHash && (
        <div className="text-center mt-8">
          Request successful
          <br />
          Tx ID:{" "}
          <Link
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href={`https://mumbai.polygonscan.com/tx/${txHash}`}
            passHref
            target="_blank"
          >
            {txHash}
          </Link>
        </div>
      )}
    </div>
  ) : loadingIssuers ? (
    <div className="text-4xl flex justify-center mt-32 gap-4">
      Loading Issuers
      <div>
        <div className="loader w-10 h-10"></div>
      </div>
    </div>
  ) : (
    <div className="text-4xl flex justify-center mt-32">No issuers found</div>
  )
}
