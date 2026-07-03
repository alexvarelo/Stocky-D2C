import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Generate color shades based on a base color
const generateColorScale = (baseColor: string) => ({
	50: `hsl(var(--${baseColor}-50))`,
	100: `hsl(var(--${baseColor}-100))`,
	200: `hsl(var(--${baseColor}-200))`,
	300: `hsl(var(--${baseColor}-300))`,
	400: `hsl(var(--${baseColor}-400))`,
	500: `hsl(var(--${baseColor}-500))`,
	600: `hsl(var(--${baseColor}-600))`,
	700: `hsl(var(--${baseColor}-700))`,
	800: `hsl(var(--${baseColor}-800))`,
	900: `hsl(var(--${baseColor}-900))`,
	950: `hsl(var(--${baseColor}-950))`,
	DEFAULT: `hsl(var(--${baseColor}-500))`,
	foreground: `hsl(var(--${baseColor}-foreground))`,
});

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
				},
				danger: {
					DEFAULT: 'hsl(var(--danger))',
					foreground: 'hsl(var(--danger-foreground))',
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
				},
				blue: generateColorScale('blue'),
				emerald: generateColorScale('emerald'),
				rose: generateColorScale('rose'),
				violet: generateColorScale('violet'),
				orange: generateColorScale('orange')
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-success': 'var(--gradient-success)',
				'gradient-danger': 'var(--gradient-danger)',
				'gradient-hero': 'var(--gradient-hero)'
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)'
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			},
			borderRadius: {
				none: '0px',
				sm: '8px',
				DEFAULT: '12px',
				md: '12px',
				lg: '20px',
				xl: '28px',
				'2xl': '28px',
				full: '9999px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				marquee: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(calc(-100% - var(--gap)))' },
				},
				'marquee-vertical': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(calc(-100% - var(--gap)))' },
				},
			},
			animation: {
				marquee: 'marquee var(--duration, 40s) linear infinite',
				'marquee-vertical': 'marquee-vertical var(--duration, 40s) linear infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
