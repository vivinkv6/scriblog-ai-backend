const { createCoreService } = require("@strapi/strapi").factories;
import OpenAI from "openai";
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});
const axios = require("axios");
module.exports = createCoreService("api::blog.blog", ({ strapi }) => ({
  // download images and upload it to the media library
  uploadImage: async (filePath, type: "CONTENT" | "IMAGE" = "IMAGE") => {
    console.log({ filePath });

    if (!filePath) return null;
    try {
      const cleanedPath = filePath?.trim().replaceAll(/ /g, "%20");
      if (!cleanedPath) return null;

      const response = await axios.get(`${cleanedPath}`, {
        responseType: "arraybuffer",
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024,
      });

      const formData = new FormData();
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "image/jpeg",
      });
      formData.append("files", blob, `image_${Date.now()}.jpg`);

      const uploadResponse = await axios.post(
        `${process.env.STRAPI_URL || "http://localhost:1337"}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );
      console.log({ uploadResponse: uploadResponse?.data[0] });

      return type == "CONTENT"
        ? uploadResponse.data[0] || null
        : uploadResponse.data[0]?.id || null;
    } catch (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }
  },

  // change the image path inside the content section

  processContent: async (content) => {
    if (!content) return "";
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    let match;
    let processedContent = content;
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";

    while ((match = imgRegex.exec(content)) !== null) {
      const originalUrl = match[1];
      console.log({ originalUrl });

      // Skip if the URL already contains STRAPI_URL
      if (originalUrl.includes(strapiUrl)) {
        continue;
      }
      console.log(originalUrl);

      const uploadedImage = await strapi
        .service("api::blog.custom")
        .uploadImage(originalUrl, "CONTENT");
      console.log({ uploadedImage });

      if (uploadedImage) {
        const newUrl = `${strapiUrl}${uploadedImage.url}`;
        processedContent = processedContent.replace(originalUrl, newUrl);
      }
    }
    return processedContent;
  },

  createAIBlog: async (prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a helpful AI that generates complete blog content in structured JSON format for SEO publishing.",
        },
      });

      // const response = await openAI.chat.completions.create({
      //   model: "gpt-4.0",
      //   messages: [
      //     {
      //       role: "system",
      //       content:
      //         "You are a helpful AI that generates complete blog content in structured JSON format for SEO publishing.",
      //     },
      //     {
      //       role: "user",
      //       content: prompt,
      //     },
      //   ],
      //   temperature: 1,
      //   max_tokens: 2048,
      //   top_p: 1,
      // });
      const cleanedJsonString = response.text?.replace(
        /^```json\n|\n```$/g,
        ""
      );

      const convertToObject = JSON.parse(cleanedJsonString);
      console.log({ convertToObject });

      const featuredImageId = await strapi
        .service("api::blog.custom")
        .uploadImage(convertToObject?.featured_image);
      const bannerImageId = await strapi
        .service("api::blog.custom")
        .uploadImage(convertToObject?.banner_image);
      const ogImageId = await strapi
        .service("api::blog.custom")
        .uploadImage(convertToObject?.og_image);
      const updatedContent = await strapi
        .service("api::blog.custom")
        .processContent(convertToObject?.content);
      let createCategory;
      const findCategory = await strapi
        .documents("api::category.category")
        .findFirst({
          filters: {
            Title: convertToObject?.category,
          },
        });

      if (findCategory) {
        // Check if category has an image
        if (!findCategory.Image) {
          // Upload new category image if provided
          const categoryImageId = await strapi
            .service("api::blog.custom")
            .uploadImage(convertToObject?.category_image);

          // Update category with new image
          await strapi.documents("api::category.category").update({
            documentId: findCategory.documentId,
            data: {
              Image: categoryImageId ? categoryImageId : "",
            },
            status: "published",
          });
        }
      }

      if (!findCategory) {
        const categoryImageId = await strapi
          .service("api::blog.custom")
          .uploadImage(convertToObject?.category_image);
        console.log({ categoryImageId });

        createCategory = await strapi
          .documents("api::category.category")
          .create({
            data: {
              Title: convertToObject?.category,
              Slug: convertToObject?.category
                ?.toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
              Image: categoryImageId ? categoryImageId : "",
              Short_Description: convertToObject?.category_short_description,
            },
            status: "published",
          });
      }

      const createdBlog = await strapi.documents("api::blog.blog").create({
        data: {
          Title: convertToObject?.title,
          Slug: convertToObject?.slug,
          Short_Description: convertToObject?.short_description,
          Content: updatedContent,
          Featured_Image: featuredImageId ? featuredImageId : "",
          Banner_Image: bannerImageId ? bannerImageId : "",

          Category: findCategory
            ? findCategory?.documentId
            : createCategory?.documentId,
          content: convertToObject?.content,
          Tags: convertToObject?.tags,
          SEO: {
            Bottom_Description: convertToObject?.bottom_description,
            Meta_Title: convertToObject?.meta_title,
            Meta_Description: convertToObject?.meta_description,
            Meta_Keywords: convertToObject?.meta_keywords,
            OG_Title: convertToObject?.og_title,
            OG_Description: convertToObject?.og_description,
            OG_Image: ogImageId ? ogImageId : "",
          },
        },
        populate: ["SEO"],
      });
      return createdBlog;
    } catch (error) {
      return error?.message;
    }
  },

  enhancePrompt: async (prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a prompt enhancer for a blog generation tool.",
        },
      });

      // const response = await openAI.chat.completions.create({
      //   model: "gpt-4o-mini",
      //   messages: [
      //     {
      //       role: "system",
      //       content: "You are a prompt enhancer for a blog generation tool.",
      //     },
      //     {
      //       role: "user",
      //       content: prompt,
      //     },
      //   ],
      //   temperature: 0.7,
      //   max_tokens: 300,
      // });

      const cleanedJsonString = response.text?.replace(
        /^```json\n|\n```$/g,
        ""
      );
      console.log({ cleanedJsonString });
      const extractPromptMessage = JSON.parse(cleanedJsonString);

      return extractPromptMessage?.prompt ? extractPromptMessage?.prompt : "";
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
