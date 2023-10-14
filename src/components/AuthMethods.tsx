import Image from "next/image"

type AuthView = "default" | "wallet"

interface AuthMethodsProps {
  handleGoogleLogin: () => Promise<void>
  setView: React.Dispatch<React.SetStateAction<AuthView>>
}

const AuthMethods = ({ handleGoogleLogin, setView }: AuthMethodsProps) => {
  return (
    <>
      <div className="buttons-container">
        <div className="social-container">
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleGoogleLogin}
          >
            <div className="btn__icon">
              <Image
                src="/icons/google.png"
                alt="Google logo"
                fill={true}
              ></Image>
            </div>
            <span className="btn__label">Google</span>
          </button>
        </div>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => setView("wallet")}
        >
          <div className="btn__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
              />
            </svg>
          </div>
          <span className="btn__label">Connect your web3 wallet</span>
        </button>
      </div>
    </>
  )
}

export default AuthMethods
