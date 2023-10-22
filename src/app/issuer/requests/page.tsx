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
import { useRouter } from "next/navigation"

const issuersTable: string = process.env
  .NEXT_PUBLIC_ISSUERS_TABLE_NAME as string // Our pre-defined health check table
const requestsTable: string = process.env
  .NEXT_PUBLIC_REQUESTS_TABLE_NAME as string // Our pre-defined health check table

export interface IRequest {
  id: number
  userAddress: string
  issuerId: string
  encryptedEmail: string
  cipher: string
}

export default function Requests() {
  const { pkpWallet, authMethod, sessionSigs } = useContext<{
    pkpWallet?: PKPEthersWallet
    authMethod?: AuthMethod
    sessionSigs?: SessionSigs
    setPkpWallet?: React.Dispatch<SetStateAction<PKPEthersWallet>>
  }>(WalletContext)
  const [requests, setRequests] = useState<IRequest[]>()
  const [loading, setLoading] = useState<boolean>(true)
  const appId = "0x1002"
  const db = new Database()
  const router = useRouter()

  useEffect(() => {
    if (pkpWallet) {
      getRequests()
    }
  }, [pkpWallet])

  const getRequests = async () => {
    const issuer = await getIssuer()
    if (issuer) {
      try {
        const preparedStmt: Statement = db.prepare(
          `SELECT * FROM ${requestsTable} WHERE issuerId = ?1`
        )

        const requests: IRequest[] = (await preparedStmt.bind(issuer.id).all())
          .results as IRequest[]
        setRequests(requests)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const issueDocument = (request: IRequest) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("request-details", JSON.stringify(request))
    }
    router.push(`/issuer/issue`)
  }

  const getIssuer = async (): Promise<Issuer | undefined> => {
    try {
      const preparedStmt: Statement = db.prepare(
        `SELECT * FROM ${issuersTable} WHERE creator = ?1`
      )

      const issuer: Issuer = (await preparedStmt
        .bind(pkpWallet?.address)
        .first()) as Issuer
      return issuer
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return requests && requests.length !== 0 ? (
    <div className="w-full">
      <header className="h-24 flex items-center justify-center text-4xl">
        Registered Requests
      </header>
      <div className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-2xl sm:p-6 md:p-8 flex flex-col gap-5 mx-auto">
        <table className="table-auto">
          <thead>
            <tr>
              <th>Address</th>
              <th>Issue document</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr className="text-center" key={request.id}>
                <td>{request.userAddress}</td>

                <td>
                  <a
                    onClick={() => issueDocument(request)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                  >
                    Issue document
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : loading ? (
    <div className="text-4xl flex justify-center mt-32 gap-4">
      Loading Requests
      <div>
        <div className="loader w-10 h-10"></div>
      </div>
    </div>
  ) : (
    <div className="text-4xl flex justify-center mt-32">No requests found</div>
  )
}
