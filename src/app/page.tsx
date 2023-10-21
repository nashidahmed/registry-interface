"use client"

import Link from "next/link"
import Button from "./components/Button"

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12 pb-32">
      <div className="text-center text-8xl font-mono mt-48">The Registry</div>
      <div className="text-center text-lg font-mono max-w-lg">
        The Registry is a document sharing app powered powered by the blockchain
        with the ease of use of the traditional Web.
      </div>
      <div className=" flex flex-col gap-12 max-w-xs text-center">
        <Link
          href={"/issuer/create"}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-6 px-12 border border-gray-400 rounded-full shadow text-2xl"
        >
          Become an Issuer
        </Link>
        <Link
          href={"/user"}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-6 px-12 border border-gray-400 rounded-full shadow text-2xl"
        >
          For Users
        </Link>
      </div>
    </div>
  )
}
