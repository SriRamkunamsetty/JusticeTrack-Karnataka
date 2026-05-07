import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "blue"
  className?: string
  children?: React.ReactNode
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-kar-slate text-white": variant === "default",
          "border-transparent bg-kar-cream text-kar-slate": variant === "secondary",
          "border-kar-blue/20 text-kar-slate": variant === "outline",
          "border-transparent bg-kar-success/10 text-kar-success": variant === "success",
          "border-transparent bg-kar-warning/10 text-kar-warning": variant === "warning",
          "border-transparent bg-kar-error/10 text-kar-error": variant === "error",
          "border-transparent bg-kar-blue/10 text-kar-blue": variant === "blue",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
