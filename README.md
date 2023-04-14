ChatGPT Telegram Bot

# ChatGPT Telegram Bot is an application based on the GPT-3.5 language model trained by OpenAI that can remember users' questions and answers and search for information in real-time on the internet, responding to questions based on content analysis. You can use this application as a bot for Telegram.

# Installation

# 1. Clone the repository

git clone https://github.com/yourusername/ChatGPT-Telegram-Bot.git

# 2. Install Node.js and npm

apt install nodejs npm

# 3. Install dependencies

npm install  axios node-summarizer cheerio cli-spinners natural cli-cursor readline

# 4. Go to your Telegram, create a Bot touch BotFather

# 5. Change variables:

const TELEGRAM_TOKEN  = 'YOUR_BOT_API';

const OPENAI_API_KEY = 'YOUR_API_KEY_OPENAI';

const googleApiKey = 'YOUR_GOOGLE_APIKEY';

const customSearchEngineId = 'YOUR_SEARCH_ENGINEID';

# 6. Run the application

node telegram.js


Request find from Internet must be as: "... " Exmample: "... where I can buy RPI 4 ?"

![... Where can I buy RPI 4?](https://github.com/EvFoAn/ChatGPT-Telegram-Bot/blob/main/description_first.png)

![What would you advise me to use from what you found?](https://github.com/EvFoAn/ChatGPT-Telegram-Bot/blob/main/description_last.png)
