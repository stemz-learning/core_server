const axios = require('axios');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const ChatbotInteraction = require('../models/chatbotInteractionModel'); // Import the model
const restrictedQuestions = require('../restrictedQuestions/restrictedQuestions.json');
const { buildRestrictedSystemPrompt } = require('../services/promptService');
// Example using OpenAI SDK; adapt to your LLM client
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "12345678";

const chatbotReply = async (req, res) => {
  const userMessage = req.body.message;
  const pageQuestions = Array.isArray(req.body.pageQuestions) ? req.body.pageQuestions : []; // new: accept scraped texts
  const token = req.headers.authorization?.split(' ')[1]; // Extract the JWT from the Authorization header
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    // Decode the JWT to get the userId
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // Verify and decode the token
    console.log("Decoded JWT:", decoded);
    const userId = decoded.id; // Extract the userId from the token payload

    // Check if the userMessage matches any restricted question (preserve existing behavior but guard if helper missing)
    let isRestricted = false;
    if (typeof isRestrictedQuestion === 'function') {
      isRestricted = isRestrictedQuestion(userMessage);
    } else if (Array.isArray(restrictedQuestions)) {
      // fallback simple exact-match check (non-destructive)
      isRestricted = restrictedQuestions.includes(String(userMessage).trim());
    }

    // Build system prompt using promptService (includes pageQuestions)
    const systemPrompt = buildRestrictedSystemPrompt(pageQuestions);

    // If you still want an extra on-top instruction when detected locally, you can uncomment:
    // if (isRestricted) systemPrompt += "\n\nNote: This question was identified as restricted. Do not provide the direct answer; give hints instead.";

    // Call the OpenAI API with system + user messages
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 150 // Reduced to enforce 2-3 sentences
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const chatbotResponse = response.data.choices[0].message.content;

    // Save the interaction to the database (keep existing behavior)
    const interaction = new ChatbotInteraction({
      userId,
      prompt: userMessage,
      response: chatbotResponse
    });
    await interaction.save();

    res.json({ reply: chatbotResponse });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid or missing token' });
    } else {
      res.status(500).json({ error: 'Chatbot API error', details: error.message });
    }
  }
};

async function askHandler(req, res, next) {
  try {
    // DEBUG: log headers/body to confirm what's arriving
    console.log('--- askHandler start ---');
    console.log('headers:', {
      contentType: req.headers['content-type'],
      origin: req.headers.origin,
      authorization: !!req.headers.authorization
    });
    console.log('raw body:', req.body);

    // accept either 'question' or 'message' from frontend
    const { pageQuestions = [], question = '', message = '' } = req.body || {};
    const userText = String(question || message || '').trim();

    console.log('parsed userText (preview):', userText ? userText.slice(0,200) : '<empty>');

    // Guard: return helpful error if user text missing
    if (!userText) {
      return res.status(400).json({ error: 'Missing question/message in request body' });
    }

    const systemPrompt = buildRestrictedSystemPrompt(Array.isArray(pageQuestions) ? pageQuestions : []);
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText }
    ];

    // DEBUG: show exactly what will be sent to the LLM
    console.log('Sending to OpenAI - messages preview:', {
      systemPreview: systemPrompt?.slice(0, 800),
      userPreview: userText.slice(0, 200),
      pageQuestionsCount: Array.isArray(pageQuestions) ? pageQuestions.length : 0
    });

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 150, // Reduced to enforce 2-3 sentences
      temperature: 0.7
    });

    console.log('OpenAI response (preview):', { choices: resp.choices?.length, raw: JSON.stringify(resp).slice(0, 2000) });
    const answer = resp.choices?.[0]?.message?.content ?? '';
    res.json({ answer });
  } catch (err) {
    console.error('askHandler error:', err);
    next(err);
  }
}

module.exports = { chatbotReply, askHandler };