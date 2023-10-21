import { Dispatch, SetStateAction } from "react"

interface InputProps {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (e: any) => void
  onBlur?: (e: any) => void
}

export default function Input({
  id,
  label,
  value,
  placeholder,
  onChange,
  onBlur,
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        required
      />
    </div>
  )
}
