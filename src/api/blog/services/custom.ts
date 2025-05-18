const { createCoreService } = require("@strapi/strapi").factories;
import OpenAI from "openai";
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
module.exports = createCoreService("api::blog.blog", ({ strapi }) => ({
  createAIBlog: async (prompt: string) => {
    try {
      const response = await openAI.chat.completions.create({
        model: "gpt-4.0",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI that generates complete blog content in structured JSON format for SEO publishing.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
      });
      return response.choices[0].message.content;
    } catch (error) {
      return error?.message;
    }
  },

  enhancePrompt: async (prompt: string) => {
    try {
      
      const response = await openAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a prompt enhancer for a blog generation tool.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content;
    } catch (error) {
      return error?.message;
    }
  },
}));
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// /**
//  * custom service
//  */

// export default () => ({
//   createAIBlog: async (prompt: string) => {
//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-4.0", // or "gpt-4.1" if you're on the API that supports it
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a helpful AI that generates complete blog content in structured JSON format for SEO publishing.",
//           },
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//         temperature: 1,
//         max_tokens: 2048,
//         top_p: 1,
//       });
//       return response.choices[0].message.content;
//     } catch (error) {
//       return error?.message;
//     }
//   },
//   enhancePrompt: async (prompt: string) => {
//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-4.0", // or "gpt-4.1" if you're on the API that supports it
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a helpful AI that generates complete blog content in structured JSON format for SEO publishing.",
//           },
//         ],
//       });
//     } catch (error) {
//       return error?.message;
//     }
//   },
// });
