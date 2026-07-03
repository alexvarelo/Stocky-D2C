import { cn } from "@/lib/utils";

// Brand mark per "Stocky Logo Spec V1.0" — asymmetric S-curve.
// Grid 100×100, container radius 24, stroke 10 with round caps.
// Both curves meet at (52, 53); top bowl smaller than bottom.
const TOP_CURVE = "M 32 46 C 32 30, 44 22, 56 22 C 68 22, 74 30, 74 38 C 74 47, 66 53, 52 53";
const BOTTOM_CURVE = "M 52 53 C 36 53, 26 60, 26 70 C 26 80, 36 86, 52 86 C 66 86, 76 79, 76 70";
const EASE_DRAW = "cubic-bezier(.65,0,.35,1)";

interface StockyLogoProps {
    size?: number;
    /**
     * ink   — dark tile, white stroke (default lockup, for light surfaces)
     * paper — white tile, ink stroke (for dark surfaces)
     * mark  — stroke only in currentColor, no tile (inline/icon use)
     */
    variant?: "ink" | "paper" | "mark";
    /** Draw-on animation (app launch behavior A). Plays once. */
    animated?: boolean;
    className?: string;
}

export function StockyLogo({ size = 32, variant = "ink", animated = false, className }: StockyLogoProps) {
    const stroke = variant === "ink" ? "#FFFFFF" : variant === "paper" ? "#0D0D0D" : "currentColor";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={cn("shrink-0", className)}
            role="img"
            aria-label="Stocky"
        >
            {animated && (
                <style>{`@keyframes stocky-draw { to { stroke-dashoffset: 0; } }`}</style>
            )}
            {variant === "ink" && <rect width="100" height="100" rx="24" fill="#0D0D0D" />}
            {variant === "paper" && <rect width="100" height="100" rx="24" fill="#FFFFFF" />}
            <path
                d={TOP_CURVE}
                fill="none"
                stroke={stroke}
                strokeWidth="10"
                strokeLinecap="round"
                style={animated ? {
                    strokeDasharray: 150,
                    strokeDashoffset: 150,
                    animation: `stocky-draw 450ms ${EASE_DRAW} 150ms forwards`
                } : undefined}
            />
            <path
                d={BOTTOM_CURVE}
                fill="none"
                stroke={stroke}
                strokeWidth="10"
                strokeLinecap="round"
                style={animated ? {
                    strokeDasharray: 160,
                    strokeDashoffset: 160,
                    animation: `stocky-draw 550ms ${EASE_DRAW} 450ms forwards`
                } : undefined}
            />
        </svg>
    );
}
