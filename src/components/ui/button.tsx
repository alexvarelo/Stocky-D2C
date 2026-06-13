import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* button-primary: white pill on dark canvas — the brand's loudest CTA */
        default: "bg-white text-[#191c1f] hover:bg-[#c9c9cd] active:bg-[#c9c9cd]",
        /* button-dark: black pill on light canvas */
        dark: "bg-[#000000] text-white hover:bg-[#191c1f]",
        /* button-soft: surface-soft pill — tertiary action */
        secondary: "bg-[#f4f4f4] text-[#191c1f] hover:bg-[#e2e2e7]",
        /* button-outline on light */
        outline: "border border-[#191c1f] bg-white text-[#191c1f] hover:bg-[#f4f4f4]",
        /* button-outline on dark */
        "outline-dark": "border border-white bg-transparent text-white hover:bg-white/10",
        ghost: "hover:bg-white/10 text-current",
        link: "text-[#376cd5] underline-offset-4 hover:underline p-0 h-auto rounded-none",
        success: "bg-[#00a87e] text-white hover:opacity-90",
        danger: "bg-[#e23b4a] text-white hover:opacity-90",
        warning: "bg-[#ec7e00] text-white hover:opacity-90",
        /* cobalt violet — reserved for featured/brand stamp only */
        brand: "bg-[#494fdf] text-white hover:bg-[#4f55f1] active:bg-[#3a40c4]",
        /* kept for compat */
        destructive: "bg-[#e23b4a] text-white hover:opacity-90",
        gradient: "bg-[#494fdf] text-white hover:opacity-90",
        financial: "bg-[#494fdf] text-white hover:opacity-90",
      },
      size: {
        default: "h-12 px-7 py-3.5 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-10 text-lg",
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
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center",
          buttonVariants({ variant, size, className }),
          isLoading && "cursor-not-allowed opacity-75"
        )}
        ref={ref}
        disabled={isLoading || disabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 flex items-center" aria-hidden="true">
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M15 8a7 7 0 11-7-7v2a5 5 0 100 10V8a7 7 0 017-7z" />
            </svg>
          </span>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
