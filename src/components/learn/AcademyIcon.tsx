import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  className?: string;
  /** Hide the tassel at tiny sizes, where it turns into noise. */
  tassel?: boolean;
  /** Accessible name; when omitted the icon is decorative. */
  label?: string;
}

/** Stocky Academy mark: the Stocky "S" wearing a graduation cap. Same artwork as /stocky-academy-icon.svg. */
export function AcademyIcon({ size = 32, className, tassel = size >= 24, label }: Props) {
  const stroke = size < 24 ? 13 : size < 40 ? 11 : 10;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <rect width="100" height="100" rx="24" fill="#0D0D0D" />
      <g transform="translate(12 24) scale(0.76)" fill="none" stroke="#FFFFFF" strokeWidth={stroke} strokeLinecap="round">
        <path d="M 32 46 C 32 30, 44 22, 56 22 C 68 22, 74 30, 74 38 C 74 47, 66 53, 52 53" />
        <path d="M 52 53 C 36 53, 26 60, 26 70 C 26 80, 36 86, 52 86 C 66 86, 76 79, 76 70" />
      </g>
      <path d="M33 26 L33 34 C33 39 67 39 67 34 L67 26 L50 32 Z" fill="#3a40c4" />
      <polygon points="50,10 82,21 50,32 18,21" fill="#494fdf" />
      {tassel && (
        <>
          <line x1="82" y1="21" x2="82" y2="36" stroke="#00a87e" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="82" cy="38.5" r="3.5" fill="#00a87e" />
        </>
      )}
    </svg>
  );
}

export default AcademyIcon;
