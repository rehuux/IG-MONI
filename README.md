# IG Monitor Bot V2 (with SS Noti)

A powerful Discord bot designed to monitor Instagram accounts for ban and unban statuses. Built with Discord.js, Puppeteer, and MongoDB.

## Features
- Real-time Instagram account status monitoring.
- Automated ban/unban notifications directly in Discord, **including a profile screenshot** of the account.
- Database support via MongoDB for robust tracking.
- Pre-compiled executable support for Windows (via `pkg`).

## Requirements
- Node.js (v18+ recommended)
- MongoDB

## Setup Instructions

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Chromium for Puppeteer:
   ```bash
   npm run build
   ```
4. Create a `.env` file in the root directory and add the necessary configuration without quotes (do not share this file with anyone):
   ```env
   # Example .env file - do not put your actual keys here!
   DISCORD_BOT_TOKEN=your_discord_bot_token
   MONGODB_URI=your_mongodb_connection_string
   ```
5. Run the bot:
   ```bash
   npm start
   ```


## Building Executable (Windows)
To build a standalone `.exe` for Windows:
```bash
npm run build-exe
```

## License
This project is licensed under the [MIT License](LICENSE).
