# Ubeauty WhatsApp Service

A high-performance WhatsApp Business API service built with **Bun** and **ElysiaJS**.

## Features

- 🚀 **Bun & ElysiaJS**: Ultra-fast performance and developer experience.
- 📡 **Webhook Handshake**: Fully implemented Meta webhook validation.
- 📩 **Messaging Service**: Utility class for sending text messages and templates.
- 📖 **Swagger UI**: Integrated API documentation.
- 🛠️ **Environment Config**: Clean configuration management.

## Getting Started

### 1. Installation

```bash
bun install
```

### 2. Configuration

Copy `.env.example` to `.env` and fill in your Meta Developer credentials:

```bash
WHATSAPP_VERIFY_TOKEN=your_secure_token
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### 3. Local Development

Run the development server with hot-reload:

```bash
bun dev
```

### 4. Webhook Setup (ngrok)

To receive webhooks locally, use ngrok:

```bash
ngrok http 7000
```

Then update your **Callback URL** in the Meta Developer Dashboard:
`https://your-ngrok-url/webhook`

## API Documentation

Once the server is running, visit `http://localhost:7000/swagger` to see the interactive documentation.

## Project Structure

- `src/index.ts`: Main entry point and route definitions.
- `src/services/whatsapp.ts`: WhatsApp Business API integration.
- `src/config.ts`: Environment variable management.
