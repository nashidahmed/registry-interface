"use client"

import { Database } from "@tableland/sdk"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Issuer {
  id: number
  name: string
  website: string
  description: string
  twitter: string
  image: string
}

export default function View({ params }: { params: { id: string } }) {
  // This table has schema: `counter INTEGER PRIMARY KEY`
  const [issuer, setIssuer] = useState<Issuer>({
    description: "This is a test",
    id: 1,
    name: "Test",
    twitter: "0x1002000000000000000001077920025070120960",
    website: "https://www.test.com",
    image:
      "https://futuretechnologies.njit.edu/sites/futuretechnologies/files/njit%20logo_0.png",
  })
  const appId = "0x1002"
  const tableName: string = process.env.NEXT_PUBLIC_ISSERS_TABLE_NAME as string // Our pre-defined health check table

  const db = new Database()

  // Type is inferred due to `Database` instance definition.
  // Or, it can be identified in `prepare`.

  const getIssuer = async () => {
    const preparedStmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?1`)

    const issuer: Issuer = await preparedStmt.bind(params.id).first()
    console.log(issuer)
    setIssuer(issuer)
  }

  const getTwitterLink = (twitterId: string) => {
    let x = appId.length
    while (twitterId[x] == "0") x++

    return `https://twitter.com/i/user/${twitterId.slice(x)}`
  }

  // useEffect(() => {
  //   getIssuer()
  // }, [params.id, getIssuer])

  return (
    <div className="container mx-96 pt-8">
      <div className="flex justify-between items-center">
        <div className="text-5xl">
          <div className="flex gap-4 items-center">
            <div className="w-32">
              {/* <Avatar
                label="Noun 97 circle"
                shape="circle"
                src={issuer.image}
              /> */}
            </div>
            {issuer?.name}
            <object
              className="w-8"
              data="/icons/verified.svg"
              type="image/svg+xml"
            ></object>
          </div>
        </div>
        <div className="text-lg">ID: {issuer.id}</div>
      </div>
      <div className="mt-12 mb-8">
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
      <div className="my-8">
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
      <div className="mt-12">
        <div className="text-xl">Description</div>
        <br />
        {issuer?.description}
      </div>
    </div>
  )
}
