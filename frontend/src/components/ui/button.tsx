import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] border border-transparent text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "border-black/5 bg-primary text-primary-foreground shadow-clay hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-clay-pressed dark:border-white/10 dark:shadow-clay-dark dark:active:shadow-clay-pressed-dark",
        destructive:
          "border-black/10 bg-destructive text-destructive-foreground shadow-clay hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-clay-pressed dark:border-white/10 dark:shadow-clay-dark dark:active:shadow-clay-pressed-dark",
        outline:
          "border-input bg-background shadow-clay hover:-translate-y-0.5 hover:bg-secondary hover:text-secondary-foreground active:translate-y-0 active:shadow-clay-pressed dark:shadow-clay-dark dark:active:shadow-clay-pressed-dark",
        secondary:
          "border-border/60 bg-secondary text-secondary-foreground shadow-clay hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-clay-pressed dark:border-white/10 dark:shadow-clay-dark dark:active:shadow-clay-pressed-dark",
        ghost:
          "border-transparent bg-transparent text-foreground shadow-none hover:bg-secondary/70 hover:text-secondary-foreground",
        link:
          "border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:underline",
        soft:
          "border-accent-foreground/10 bg-accent text-accent-foreground shadow-clay hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-clay-pressed dark:border-white/10 dark:shadow-clay-dark dark:active:shadow-clay-pressed-dark",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 [&_svg]:size-3.5",
        "icon-lg": "h-12 w-12 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
