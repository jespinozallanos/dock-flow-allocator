
import type { Config } from "tailwindcss";

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
				marine: {
					DEFAULT: 'hsl(207 100% 15%)', // ASMAR navy blue
					light: 'hsl(207 100% 25%)',
					accent: 'hsl(210 11% 71%)', // ASMAR gray
					water: 'hsl(210 11% 96%)',
				},
				tide: {
					safe: '#06B6D4', // Cyan-500
					warning: '#F59E0B', // Amber-500  
					danger: '#EF4444', // Red-500
					low: '#93C5FD', // Blue-300
					high: '#1D4ED8', // Blue-700
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'ship-sail': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'wave': {
					'0%': { transform: 'translateX(0)' },
					'50%': { transform: 'translateX(-25%)' },
					'100%': { transform: 'translateX(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'ship-sail': 'ship-sail 1.5s ease-out',
				'wave': 'wave 10s ease-in-out infinite'
			},
			backgroundImage: {
				'blue-stripes': 'linear-gradient(45deg, rgba(14, 165, 233, 0.05) 25%, transparent 25%, transparent 50%, rgba(14, 165, 233, 0.05) 50%, rgba(14, 165, 233, 0.05) 75%, transparent 75%, transparent)',
				'tide-gradient': 'linear-gradient(to top, #06B6D4 0%, #0EA5E9 50%, #93C5FD 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
