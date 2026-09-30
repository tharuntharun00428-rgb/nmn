const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const askGemini = async (prompt) => {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const message = error?.message || "";

      // Quota exceeded — don't keep retrying
      if (message.includes("429")) {
        throw new Error(
          "Gemini quota exceeded. Please wait for the quota to reset or use another API key/model."
        );
      }

      // Temporary server problem — retry
      const isTemporaryError =
        message.includes("503") ||
        message.includes("Service Unavailable");

      if (!isTemporaryError || attempt === maxRetries) {
        throw error;
      }

      const delay = 5000 * Math.pow(2, attempt);

      console.log(
        `Gemini temporarily unavailable. Retrying in ${
          delay / 1000
        } seconds...`
      );

      await sleep(delay);
    }
  }
};

module.exports = { askGemini };