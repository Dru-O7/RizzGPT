const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const bodyParser = require("body-parser");
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const cors = require('cors');
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

// Define a global conversation log
let conversationLog = [];

// Define a function to generate a prompt for the GPT
function generatePrompt(pickupLine) {
    return `
      The following is a pickup line that needs feedback:
  
      Pickup line: ${pickupLine}
      
      Feedback:
      `;
}

// Define a function to handle a user's feedback and generate potential better options of the same pickup line
async function handleFeedback(pickupLine, feedback, rating) {
  const prompt = generatePrompt(pickupLine) + feedback;

  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: prompt,
    max_tokens: 128,
    n: 1,
    stop: "\n",
    temperature: 0.5,
  });

  const betterOptions = response.data.choices[0].text.trim().split("\n");

  conversationLog.push({ pickupLine: pickupLine, feedback: feedback, rating: rating, betterOptions: betterOptions });

  return betterOptions;
}

// Define a route to handle incoming feedback
app.post("/feedback", async (req, res) => {
  const pickupLine = req.body.pickupLine;
  const feedback = req.body.feedback;
  const rating = req.body.rating;

  const betterOptions = await handleFeedback(pickupLine, feedback, rating);

  res.json({ betterOptions });
});

// Define a route to retrieve the conversation log
app.get("/log", (req, res) => {
    res.json({ conversationLog });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
