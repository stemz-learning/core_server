const axios = require('axios');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const ChatbotInteraction = require('../models/chatbotInteractionModel'); // Import the model

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "12345678";

const chatbotReply = async (req, res) => {
  const userMessage = req.body.message;
  const token = req.headers.authorization?.split(' ')[1]; // Extract the JWT from the Authorization header
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    // Decode the JWT to get the userId
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // Verify and decode the token
    console.log("Decoded JWT:", decoded);
    const userId = decoded.id; // Extract the userId from the token payload

    // Call the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const chatbotResponse = response.data.choices[0].message.content;

    // Save the interaction to the database
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

module.exports = { chatbotReply };