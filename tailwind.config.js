/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                serif: ['Lora', 'serif'],
            },
            colors: {
                brand: {
                    // Manual de Identidade Visual v1.0: #071D33, #3F7893, #E63343, #F4EFEA, #E8E1DD, #1F1F1F, #B94734, #2E7D68
                    red: '#E63343',
                    'red-dark': '#C01B29', // variante só para texto pequeno (contraste AA)
                    blue: '#3F7893',
                    'blue-dark': '#2F5F78', // variante só para texto sobre fundo claro (contraste AA)
                    dark: '#1F1F1F',
                    accent: '#F7E5E2',
                    navy: '#071D33',
                    terracotta: '#B94734',
                    cream: '#F4EFEA',
                    sand: '#E8E1DD',
                    sage: '#2E7D68',
                    'sage-dark': '#256B58', // variante só para texto pequeno sobre fundo claro (contraste AA)
                    light: '#F3F6FA',
                }
            },
            animation: {
                'gradient-x': 'gradient-x 3s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'slide-in-bottom': 'slideInBottom 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'fadeIn': {
                    '0%': { opacity: '0', transform: 'translateY(5px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slideInRight': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slideInBottom': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
