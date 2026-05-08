import * as React from "react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef(({ className, label, checked, onChange, ...props }, ref) => (
  <label className={cn("inline-flex items-center gap-2 cursor-pointer text-gray-300 text-sm", className)}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
      ref={ref}
      {...props}
    />
    {label}
  </label>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
