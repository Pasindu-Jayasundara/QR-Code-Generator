# QR Code Generator

A browser-based QR code generator built with React and Vite. Enter a link or text, customize the code, and download it in the format you need.

## Features

- Generate QR codes from links or plain text
- Add an optional center logo
- Customize the QR code color
- Adjust the logo size
- Download as PNG, SVG, JPEG, or WebP
- Choose raster export sizes up to 4096 x 4096
- Generate everything locally in the browser

## Tech Stack

- React
- Vite
- `qrcode`

## Getting Started

From the `Frontend` directory, install dependencies and start the development server:

```bash
cd Frontend
npm install
npm run dev
```

Open the local URL shown by Vite in your browser.

## Available Scripts

Run these commands from `Frontend`:

```bash
npm run dev      # Start the development server
npm run build    # Build for production
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Privacy

QR codes are generated in the browser. The entered content and uploaded logo are not sent to a server by this application.
