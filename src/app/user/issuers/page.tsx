"use client"

import { Issuer } from "@/issuer/[id]/page"
import { Database, Statement } from "@tableland/sdk"
import Link from "next/link"
import { useEffect, useState } from "react"
const tableName: string = process.env.NEXT_PUBLIC_ISSERS_TABLE_NAME as string // Our pre-defined health check table

export default function Issuers() {
  const [issuers, setIssuers] = useState<Issuer[]>()
  const [loading, setLoading] = useState<boolean>(true)
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
      console.log(issuers)
      setIssuers(issuers)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const getTwitterLink = (twitterId: string) => {
    let x = appId.length
    while (twitterId[x] == "0") x++

    return `https://twitter.com/i/user/${twitterId.slice(x)}`
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
              <>
                <tr className="text-center">
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
                    <Link
                      href={`/user/request/${issuer.id}`}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      passHref
                    >
                      Request {issuer.name}
                    </Link>
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : loading ? (
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
