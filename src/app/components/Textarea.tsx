import { Dispatch, SetStateAction } from "react"

interface TextareaProps {
  id: string
  label: string
  value: string
  placeholder: string
  onChange: (e: any) => void
  onBlur?: (e: any) => void
}

export default function Textarea({
  id,
  label,
  value,
  placeholder,
  onChange,
  onBlur,
}: TextareaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        {label}
      </label>
      <textarea
        id={id}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        rows={5}
        required
      ></textarea>
    </div>
  )
}
