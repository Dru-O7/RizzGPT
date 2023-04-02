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
    return `Rate and provide feedback for the following pickup line: If suggesting better options suggest 10/10 rated pickup line alternative the user could use
    Pickup line: ${pickupLine}
    Your feedback:
    Feedback: [positive/neutral/negative]
    Rating: [1-10]
    Better options: [comma-separated list of better pickup lines]`;
  }
// Define a function to handle a user's feedback and generate potential better options of the same pickup line

function getFeedback(pickupLine) {
    const prompt = `provide feedback for the following pickup line: ${pickupLine}\nFeedback should tell the positive and negatives of the given pickup line. be as blunt as possible\n`;
  
    return openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 128,
    }).then(response => {
      const feedback = response.data.choices[0].text.trim();
      return { feedback };
    });
  }
  
  function getRating(pickupLine) {
    const prompt = `Rate the following pickup line on the basis of creativity, originality, romantic approach and respect.: ${pickupLine}\nRating should be out of 10, also state the reason behind the rating\n`;
  
    return openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 64,
    }).then(response => {
      const rating = response.data.choices[0].text.trim();
      return { rating };
    });
  }
  
  function getBetterOptions(pickupLine) {
    const prompt = `Suggest better pickup line than the following: ${pickupLine}\nBetter option should be a 10/10 pickup line according to you which satisfies every criteria such as originality, creativity, respect, romance, etc.:\n ONLY SHOW 1 PickUP LINE, NO MORE!`;
  
    return openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 256,
    }).then(response => {
      const betterOptions = response.data.choices[0].text.trim();
      return { betterOptions };
    });
  }
  


  

// Define a route to retrieve the conversation log
app.get("/log", (req, res) => {
  res.json({ conversationLog });
});

// Handle "Get Feedback" AJAX request
app.post("/feedback", async (req, res) => {
    const { pickupLine } = req.body;
    const { feedback } = await getFeedback(pickupLine);
    res.json({ feedback });
  });
  
  // Handle "Get Rating" AJAX request
  app.post("/rating", async (req, res) => {
    const { pickupLine } = req.body;
    const { rating } = await getRating(pickupLine);
    res.json({ rating });
  });
  
  // Handle "Get Better Options" AJAX request
  app.post("/better-options", async (req, res) => {
    const { pickupLine } = req.body;
    const { betterOptions } = await getBetterOptions(pickupLine);
    res.json({ betterOptions });
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
