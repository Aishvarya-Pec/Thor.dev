import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-thor-400 text-white hover:bg-thor-400/90 shadow-lg hover:shadow-xl transition-all duration-300",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "border border-thor-border bg-transparent hover:bg-thor-400/10 hover:text-thor-400",
        secondary:
          "bg-thor-300 text-white hover:bg-thor-300/90",
        ghost: "hover:bg-thor-400/10 hover:text-thor-400",
        link: "text-thor-400 underline-offset-4 hover:underline",
        cosmic: "bg-gradient-to-r from-cosmic-800 to-cosmic-700 text-white hover:from-cosmic-700 hover:to-cosmic-600 shadow-lg hover:shadow-xl border border-cosmic-600/50 transition-all duration-300",
        lightning: "bg-gradient-to-r from-lightning-400 to-lightning-500 text-white hover:from-lightning-300 hover:to-lightning-400 shadow-lg hover:shadow-xl hover:animate-glow transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }