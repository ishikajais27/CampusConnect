import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      "colors": {
        "tertiary": "#685e30",
        "on-secondary": "#ffffff",
        "primary": "#170e0a",
        "on-error": "#ffffff",
        "outline": "#807570",
        "tertiary-fixed": "#f1e3a9",
        "on-tertiary": "#ffffff",
        "secondary": "#6d5b4f",
        "background": "#fdf9f1",
        "secondary-container": "#f4dbcc",
        "on-primary": "#ffffff",
        "on-surface": "#1c1c17",
        "primary-fixed-dim": "#d4c3bb",
        "on-primary-fixed": "#231a15",
        "surface": "#fdf9f1",
        "surface-container-low": "#f7f3eb",
        "on-primary-container": "#988982",
        "surface-dim": "#dddad2",
        "on-error-container": "#93000a",
        "on-secondary-container": "#725f53",
        "on-tertiary-fixed": "#211b00",
        "tertiary-container": "#b8ab76",
        "on-secondary-fixed-variant": "#544339",
        "on-surface-variant": "#4e4541",
        "error": "#ba1a1a",
        "secondary-fixed-dim": "#dac2b4",
        "primary-container": "#2d231e",
        "on-primary-fixed-variant": "#50443e",
        "inverse-primary": "#d4c3bb",
        "surface-bright": "#fdf9f1",
        "on-tertiary-fixed-variant": "#50471b",
        "error-container": "#ffdad6",
        "inverse-on-surface": "#f4f0e8",
        "surface-container-highest": "#e6e2da",
        "on-tertiary-container": "#483f14",
        "surface-container-lowest": "#ffffff",
        "on-background": "#1c1c17",
        "secondary-fixed": "#f7decf",
        "surface-container": "#f1ede6",
        "on-secondary-fixed": "#261910",
        "surface-container-high": "#ece8e0",
        "inverse-surface": "#31302b",
        "primary-fixed": "#f1dfd7",
        "surface-tint": "#FAF6EE",
        "outline-variant": "#d1c4be",
        "tertiary-fixed-dim": "#d4c78f",
        "surface-variant": "#e6e2da",
        "divider-hairline": "#EBE1D3",
        "pale-pistachio": "#EAF1D9",
        "apricot": "#F3AA83",
        "petal-pink": "#F9E0E7",
        "cocoa-sand": "#736357",
        "canvas-cream": "#FFFDF7",
        "surface-white": "#FFFFFF",
        "muted-aubergine": "#3E2F35"
      },
      "fontFamily": {
        "headline-md": [
          "Playfair Display"
        ],
        "body-lg": [
          "Inter"
        ],
        "label-md": [
          "Inter"
        ],
        "display": [
          "Newsreader"
        ],
        "headline-lg": [
          "Playfair Display"
        ],
        "label-caps": [
          "Inter"
        ],
        "title-md": [
          "Inter"
        ],
        "caption": [
          "Inter"
        ],
        "display-mobile": [
          "Newsreader"
        ],
        "headline-lg-mobile": [
          "Playfair Display"
        ],
        "body-md": [
          "Inter"
        ],
        "headline-sm": [
          "Playfair Display"
        ],
        "body-sm": [
          "Inter"
        ],
        "display-hero-mobile": [
          "Playfair Display"
        ],
        "display-hero": [
          "Playfair Display"
        ],
        "editorial-italic": [
          "Playfair Display"
        ],
        "label-sm": [
          "Inter"
        ],
        "meta-caps": [
          "Inter"
        ]
      },
      "fontSize": {
        "headline-md": [
          "26px",
          {
            "lineHeight": "34px",
            "fontWeight": "500"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "label-md": [
          "13px",
          {
            "lineHeight": "18px",
            "letterSpacing": "0.02em",
            "fontWeight": "600"
          }
        ],
        "display": [
          "3.5rem",
          {
            "lineHeight": "4rem",
            "letterSpacing": "-0.02em",
            "fontWeight": "400"
          }
        ],
        "headline-lg": [
          "38px",
          {
            "lineHeight": "46px",
            "letterSpacing": "-0.015em",
            "fontWeight": "600"
          }
        ],
        "label-caps": [
          "0.6875rem",
          {
            "lineHeight": "1rem",
            "letterSpacing": "0.08em",
            "fontWeight": "700"
          }
        ],
        "title-md": [
          "1.125rem",
          {
            "lineHeight": "1.625rem",
            "letterSpacing": "-0.005em",
            "fontWeight": "600"
          }
        ],
        "caption": [
          "0.75rem",
          {
            "lineHeight": "1.125rem",
            "letterSpacing": "0.01em",
            "fontWeight": "400"
          }
        ],
        "display-mobile": [
          "2.25rem",
          {
            "lineHeight": "2.75rem",
            "letterSpacing": "-0.015em",
            "fontWeight": "400"
          }
        ],
        "headline-lg-mobile": [
          "28px",
          {
            "lineHeight": "36px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "body-md": [
          "15px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "headline-sm": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "body-sm": [
          "13px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "display-hero-mobile": [
          "36px",
          {
            "lineHeight": "44px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "display-hero": [
          "56px",
          {
            "lineHeight": "64px",
            "letterSpacing": "-0.02em",
            "fontWeight": "600"
          }
        ],
        "editorial-italic": [
          "22px",
          {
            "lineHeight": "30px",
            "fontWeight": "400"
          }
        ],
        "label-sm": [
          "11px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.04em",
            "fontWeight": "600"
          }
        ],
        "meta-caps": [
          "10px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.08em",
            "fontWeight": "700"
          }
        ]
      }
    }
  },
  plugins: [],
}
export default config
