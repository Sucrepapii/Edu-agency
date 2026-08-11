const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { generateText } = require('ai');

const google = createGoogleGenerativeAI({
  apiKey: 'AIzaSyCelFyuZc1avsoi2JCNYg2Lz92Zgh-PO1I',
});

async function main() {
  try {
    const result = await generateText({
      model: google('gemini-3.5-flash'),
      prompt: 'Hello',
    });
    console.log(result.text);
  } catch (error) {
    console.error("ERROR:", error);
  }
}
main();
