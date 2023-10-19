export default function Button({
  children,
  onClick,
  secondary,
  type,
}: {
  children: React.ReactNode
  onClick?: () => void
  secondary?: boolean
  type?: "button" | "submit" | "reset" | undefined
}) {
  return secondary ? (
    <button
      type={type}
      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-4 border border-blue-500 hover:border-transparent rounded"
      onClick={onClick}
    >
      {children}
    </button>
  ) : (
    <button
      type={type}
      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
