import * as React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, label, options, error, ...props }, ref) => {
  if (options && options.length) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          className={cn(
            "flex h-10 w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            error ? "border-red-500" : "border-gray-600",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    )
  }
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500" : "border-gray-600",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    </div>
  )
})
Select.displayName = "Select"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <option className={cn("bg-gray-800 text-white", className)} ref={ref} {...props}>
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("block text-sm font-medium text-gray-300 mb-1.5", className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

export { Select, SelectItem, SelectLabel }
