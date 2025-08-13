import { Loader2 } from "lucide-react"

export default function Spinner() {
  return (
    <div className="flex justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
    </div>
  )
}