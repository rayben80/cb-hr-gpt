/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class', 'class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        screens: {
            xs: '475px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
        extend: {
            spacing: {
                18: '4.5rem',
                88: '22rem',
            },
            fontSize: {
                xs: [
                    '0.75rem',
                    {
                        lineHeight: '1rem',
                    },
                ],
                sm: [
                    '0.875rem',
                    {
                        lineHeight: '1.25rem',
                    },
                ],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'drag-bounce': 'dragBounce 0.6s ease-out',
                'drop-success': 'dropSuccess 0.4s ease-out',
                'hover-lift': 'hoverLift 0.2s ease-out forwards',
                'scale-in': 'scaleIn 0.15s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'spin-slow': 'spin 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                slideUp: {
                    '0%': {
                        transform: 'translateY(10px)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1',
                    },
                },
                slideDown: {
                    '0%': {
                        transform: 'translateY(-10px)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1',
                    },
                },
                dragBounce: {
                    '0%': {
                        transform: 'scale(1)',
                    },
                    '50%': {
                        transform: 'scale(1.05)',
                    },
                    '100%': {
                        transform: 'scale(1)',
                    },
                },
                dropSuccess: {
                    '0%': {
                        transform: 'scale(1)',
                        backgroundColor: 'rgb(14 165 233 / 0.1)',
                    },
                    '50%': {
                        transform: 'scale(1.02)',
                        backgroundColor: 'rgb(34 197 94 / 0.2)',
                    },
                    '100%': {
                        transform: 'scale(1)',
                        backgroundColor: 'transparent',
                    },
                },
                hoverLift: {
                    '0%': {
                        transform: 'translateY(0)',
                        boxShadow: 'var(--shadow-sm)',
                    },
                    '100%': {
                        transform: 'translateY(-2px)',
                        boxShadow: 'var(--shadow-md)',
                    },
                },
                scaleIn: {
                    '0%': {
                        transform: 'scale(0.95)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'scale(1)',
                        opacity: '1',
                    },
                },
                pulseGlow: {
                    '0%, 100%': {
                        boxShadow: '0 0 5px rgb(37 99 235 / 0.3)',
                    },
                    '50%': {
                        boxShadow: '0 0 20px rgb(37 99 235 / 0.5)',
                    },
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            colors: {
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                card: {
                    DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                    foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
                    foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
                },
                border: 'hsl(var(--border) / <alpha-value>)',
                input: 'hsl(var(--input) / <alpha-value>)',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
                // Glassmorphism colors
                glass: {
                    DEFAULT: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                },
                // Gradient colors
                gradient: {
                    start: 'var(--gradient-start)',
                    mid: 'var(--gradient-mid)',
                    end: 'var(--gradient-end)',
                },
            },
            // Backdrop blur for glassmorphism
            backdropBlur: {
                glass: 'var(--glass-blur)',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
