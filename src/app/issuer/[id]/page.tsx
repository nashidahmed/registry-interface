"use client"

import { Database } from "@tableland/sdk"
import Link from "next/link"
import { useEffect, useState } from "react"

export interface Issuer {
  id: number
  name: string
  creator: string
  website: string
  description: string
  twitter: string
  image: string
}

export default function View({ params }: { params: { id: string } }) {
  // This table has schema: `counter INTEGER PRIMARY KEY`
  const [issuer, setIssuer] = useState<Issuer>()
  const [loading, setLoading] = useState<boolean>(true)
  const appId = "0x1002"
  const tableName: string = process.env.NEXT_PUBLIC_ISSUERS_TABLE_NAME as string // Our pre-defined health check table

  const db = new Database()

  // Type is inferred due to `Database` instance definition.
  // Or, it can be identified in `prepare`.

  useEffect(() => {
    getIssuer()
  }, [])

  const getIssuer = async () => {
    try {
      const preparedStmt = db.prepare(
        `SELECT * FROM ${tableName} WHERE id = ?1`
      )

      const issuer: Issuer = await preparedStmt.bind(params.id).first()
      setIssuer(issuer)
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

  // useEffect(() => {
  //   getIssuer()
  // }, [params.id, getIssuer])

  return issuer ? (
    <div className="w-full">
      <div className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-2xl sm:p-6 md:p-8 flex flex-col gap-5 mx-auto">
        <div className="flex justify-between items-center">
          <div className="text-5xl">
            <div className="flex gap-4 items-center">
              <div className="w-32 h-32 rounded-full flex items-center justify-center">
                <img
                  className="h-32 w-32 object-cover rounded-full"
                  src={issuer.image}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null // prevents looping
                    currentTarget.src = "/icons/no-image.jpg"
                  }}
                />
              </div>
              {issuer?.name}
              <object
                className="w-8"
                data="/icons/verified.svg"
                type="image/svg+xml"
              ></object>
            </div>
          </div>
        </div>
        <div className="my-2">
          {issuer.name} has proved ownership of{" "}
          <Link
            href={getTwitterLink(issuer.twitter)}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            passHref
            target="_blank"
          >
            this Twitter account
          </Link>{" "}
          through Sismo.{" "}
          <Link
            href={"https://www.sismo.io/"}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            passHref
            target="_blank"
          >
            Learn more.
          </Link>
        </div>
        <div className="my-2">
          Website Link:{" "}
          <Link
            href={issuer.website}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            passHref
            target="_blank"
          >
            {issuer?.website}
          </Link>
        </div>
        <div className="mt-6">
          <div className="text-xl">Description</div>
          <br />
          {issuer?.description}
        </div>
      </div>
    </div>
  ) : loading ? (
    <div className="text-4xl flex justify-center mt-32 gap-4">
      Loading Issuer
      <div>
        <div className="loader w-10 h-10"></div>
      </div>
    </div>
  ) : (
    <div className="text-4xl flex justify-center mt-32">Issuer not found</div>
  )
}
