const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const SummarizerManager = require('node-summarizer').SummarizerManager;
const cheerio = require('cheerio');
const natural = require('natural');
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
const TELEGRAM_TOKEN = 'TELEGRAM_BOT_API_KEY';

const OPENAI_API_KEY = 'API_KEY';

const googleSearchBaseUrl = 'https://www.googleapis.com/customsearch/v1';

const googleApiKey = 'API_KEY';
const customSearchEngineId = 'API_KEY';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

async function searchQuery(query) {
  try {
    const response = await axios.get(googleSearchBaseUrl, {
      params: {
        key: googleApiKey,
        cx: customSearchEngineId,
        q: query,
        num: 6,
        gl: 'ua,en',
        hl: 'ua,en,ru',
      },
    });
    return response.data.items;
  } catch (error) {
    console.error('Error in search query:', error);
    return null;
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function sendMessage(message, chatId) {
      try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' } );
    } catch (error) {
      console.error('Error sending message:', error);
   }
}


let previousMessages = [];


const runBot = async () => {
  try {
    let lastResponse = '';
    // const previousMessages = [];
    bot.on('message', async (msg) => {
      const message = msg.text;
      const chatId = msg.chat.id;

      previousMessages.push(message);
      if (previousMessages.length > 8) {
        previousMessages.shift();
      }

      await delay(2000);

      if (message.toLowerCase().startsWith('... ')) {
          await findInformation(message, chatId);
      } else {
        await handleRegularMessage(message, chatId, openaiEndpoint, previousMessages);
      }
    });
  } catch (error) {
    console.error('Error in bot:', error);
  }
};

const findInformation = async (message, chatId) => {
  const msg = message.toLowerCase();
  // await sendMessage('typing ...', chatId);
  const searchResults = await searchQuery(msg.slice(6));
  // console.log("LOG001", searchResults)
  if (searchResults && searchResults.length > 0) {
    const linksToAnalyze = searchResults.map((result) => `${result.link}`).join("\n");

    const title = searchResults.map(result => `- ${result.title}`).join('\n');
    const tl = title.replace(/[\#\$\%\&\(\)\*\+\/:;<=>\?@\^_\{\|\}\~]/g, '');

    await sendMessage('typing ...', chatId);

    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
             { role: 'system', content: 'You are a helpful assistant.' },
             { role: 'user', content: `Show the descriptions of pages: ${linksToAnalyze} and provide your comprehensive evaluation of the information found on the requests and the output of what you analyzed. This is title: ${tl} -> This is link: ${linksToAnalyze}. In formatting response, you must use: "[title](link)" must included 100% . Brackets and quotes must be preserved. Brief analysis of the page and overall conclusions for all pages - the analysis of the pages and general conclusions should be added.` },
              // For use RUSSIAN LANG - { role: 'user', content: `Покажи описание страниц:${linksToAnalyze} дай свою комплексную оценку найденной информации по запросам и вывод того что ты анализировал. Это title:${tl} -> Это link:${linksToAnalyze}. В оформление своего ответа ты должен 100% использовать следующее: [title](link) ( скобки и кавычки должны быть сохранены ) | краткий анализ страницы и общие выводы по всем страницам - анализ страниц и общие вывод должны быть добавлены` },
	        ],
      temperature: 0.0,
    };

    const response = await axios.post(openaiEndpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });

    const responseBody = response.data;
    if (responseBody.hasOwnProperty('choices') && responseBody.choices.length > 0) {
      let aiAnswer = responseBody.choices[0].message.content;
      aiAnswer = aiAnswer.replace(/```/g, '`');
      const wrappedText = '' + aiAnswer + '';

      const aiReply = wrappedText;
      lastResponse = aiReply;

      const filteredReply = filterResponse(aiReply);

      await sendMessage(filteredReply, chatId);
      previousMessages.push(aiReply);
      if (previousMessages.length > 4) {
          previousMessages.shift();
       }
      // console.log('LOG', previousMessages)

    } else {
      console.error('Invalid response from OpenAI API');
    }
  } else {
    await sendMessage('Could not find information.', chatId);
  }
};

const filterResponse = (response) => {
  // Add any filtering logic here if needed
  return response;
};

const handleRegularMessage = async (message, chatId, openaiEndpoint, previousMessages) => {
  const requestBody = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...previous message.map((msg, index) => ({
        role: index % 8 === 0 ? 'user' : 'assistant',
        content: msg,
      })),
      { role: 'user', content: message },
    ],
    temperature: 0.2,
  };

  await sendMessage('typing ...', chatId);
  const response = await axios.post(openaiEndpoint, requestBody, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  });

  const responseBody = response.data;
  if (responseBody.hasOwnProperty('choices') && responseBody.choices.length > 0) {
    let aiAnswer = responseBody.choices[0].message.content;
    aiAnswer = aiAnswer.replace(/```/g, '`');
    const wrappedText = '' + aiAnswer + '';

    const aiReply = wrappedText;
    lastResponse = aiReply;

    const filteredReply = filterResponse(aiReply);

    await sendMessage(filteredReply, chatId);
    previousMessages.push(aiReply);
    if (previousMessages.length > 8) {
      previousMessages.shift();
    }
    // console.log('LOG002', previousMessages)
  } else {
    console.error('Invalid response from OpenAI API');
  }
};

runBot();
