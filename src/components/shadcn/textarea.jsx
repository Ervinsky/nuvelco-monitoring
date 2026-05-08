import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, label, error, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
    )}
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        error ? "border-red-500" : "border-gray-600",
        className
      )}
      ref={ref}
      {...props}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
))
Textarea.displayName = "Textarea"

export { Textarea }
