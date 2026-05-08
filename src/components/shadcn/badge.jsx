import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500",
  {
    variants: {
      variant: {
        default: "bg-emerald-500/20 text-emerald-400",
        secondary: "bg-gray-700 text-gray-300",
        destructive: "bg-red-500/20 text-red-400",
        outline: "border border-gray-600 text-gray-300",
        warning: "bg-amber-500/20 text-amber-400",
        info: "bg-blue-500/20 text-blue-400",
        primary: "bg-sky-500/20 text-sky-400",
        success: "bg-green-500/20 text-green-400",
        danger: "bg-red-500/20 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
