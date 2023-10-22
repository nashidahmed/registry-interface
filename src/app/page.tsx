"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pl-16">
      <div className="text-center text-4xl font-mono mt-16 mb-4">
        Welcome to TheRegistry: Secure and Seamless Document Management
      </div>
      <div className="flex w-full">
        <div className="text-lg font-mono w-1/2 px-12 text-justify">
          At TheRegistry, we're transforming the way documents are issued and
          managed, making the process secure, efficient, and user-friendly. Say
          goodbye to traditional paper documents and complex blockchain
          interactions. With our platform, you can effortlessly request and
          access your digital documents.
          <br />
          <br />
          <div>
            <div className="mb-4 text-xl font-extrabold">Key Features:</div>
            <ul className="list-disc">
              <li className="mb-2">
                <strong>Streamlined User Experience</strong>: We've integrated
                Lit protocol to provide a seamless experience. You can generate
                decentralized keys linked to your Gmail address, eliminating the
                need for complex tools like MetaMask.
              </li>
              <li className="mb-2">
                <strong>Gasless Transactions</strong>: Enjoy gas-free
                interactions, whether you're an Issuer or a User. No more
                worries about transaction fees.
              </li>
              <li className="mb-2">
                <strong>Cost-Efficiency</strong>: Our deployment on the Polygon
                network means you benefit from lower transaction fees, making
                document management more affordable.
              </li>
              <li className="mb-2">
                <strong>Twitter Authenticity</strong>: We ensure the
                authenticity of Issuers through zero-knowledge proofs. Only the
                genuine Twitter account owner can issue and verify documents.
              </li>
              <li className="mb-2">
                <strong>Data Security</strong>: We use Tableland, a web3-native
                database, to store your profile information, document requests,
                and issued documents. Your data is in safe hands.
              </li>
              <li className="mb-2">
                <strong>Document Encryption</strong>: Lit protocol not only
                streamlines the process but also secures your documents. Only
                designated Users can decrypt and access the documents issued to
                them.
              </li>
            </ul>
          </div>
        </div>
        <div className="justify-center w-1/2">
          <div className="text-xl px-48 my-16 text-justify">
            Join us in the future of document management. Become and issuer or
            request documents and experience a new level of simplicity and
            security.
          </div>
          <div className="flex flex-col gap-12 max-w-xs text-center mx-auto">
            <Link
              href={"/issuer/create"}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-6 px-12 border border-gray-400 rounded-full shadow-2xl text-2xl"
            >
              Become an Issuer
            </Link>
            <Link
              href={"/user"}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-6 px-12 border border-gray-400 rounded-full shadow-2xl text-2xl"
            >
              For Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
