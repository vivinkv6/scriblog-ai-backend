/**
 * A set of functions called "actions" for `custom`
 */

export default {
  generateBlogByAI: async (ctx, next) => {
    try {
      const { prompt } = ctx.request.body;

      if (!prompt) {
        return ctx.badRequest("Prompt is required");
      }

      const existingSlugs = (
        await strapi.documents("api::blog.blog").findMany({ fields: ["Slug"] })
      )
        .map((blog) => blog.Slug)
        .join(",");

      const aiPrompt = `You are a blog content generator. Generate a blog post in the following JSON format:  
      {  
        "title": "",  
        "slug": "",  
        "featured_image": "",  
        "banner_image": "",  
        "og_image": "",  
        "short_description": "",  
        "meta_title": "",  
        "meta_description": "",  
        "meta_keywords": "",  
        "og_title": "",  
        "og_description": "",  
        "content": "",  
        "category": "",  
        "bottom_description": ""  
      }  
      
      Instructions:  
      - Title should be relevant and engaging.  
      - Slug should be a URL-friendly version of the title (lowercase, hyphen-separated).  
      - featured_image, banner_image, og_image should be links to **publicly available, royalty-free images** (no watermark), from sources like:
        - Pexels (https://www.pexels.com)
        - Unsplash (https://unsplash.com)
        - Pixabay (https://pixabay.com)
        - Wikimedia Commons (for logos or tech-specific graphics)
        - Official websites or GitHub repositories (for open-source project logos, if allowed under license)  
      - For programming/tech topics (like JavaScript, Node.js, React, Python, etc.), ensure the image is relevant to the topic — e.g.,:
        - A screenshot, logo, code editor mockup, UI wireframe, or abstract tech background.  
      - short_description should summarize the article in 1-2 lines.  
      - meta_title, meta_description, meta_keywords, og_title, og_description should be optimized for SEO.  
      - content should be formatted in clean HTML, and must include:  
        - The title as a heading.  
        - An engaging introduction.  
        - At least one relevant image based on the topic.  
        - Well-structured body content with headings and subheadings.  
        - Use HTML elements like <h1>, <h2>, <p>, <img>, etc.  
      
      Now generate the blog for the following topic: "${prompt}"
      Here are the existing slugs: ${existingSlugs}. Please ensure the new slug is unique and not in this list.
      `;

      const aiResponse = await strapi
        .service("api::blog.custom")
        .createAIBlog(aiPrompt);

      console.log({ aiResponse });

      return (ctx.body = {
        status: "success",
        data: aiResponse,
      });
    } catch (err) {
      ctx.body = err;
    }
  },

  enhancePrompt: async (ctx, next) => {
    try {
      const { prompt } = ctx.request.body;
      if (!prompt) {
        return ctx.badRequest("Prompt is required");
      }
      const aiPrompt = `
You are an expert prompt enhancer.

Take the user's basic blog prompt below and turn it into a much clearer, more specific prompt that will help an AI generate high-quality blog content.

Make sure the enhanced prompt:
- Clearly explains the goal of the blog.
- Includes audience type if possible.
- Asks for sections like introduction, benefits, examples, and conclusion.
- Mentions using SEO practices (meta title, keywords, description).
- Requests formatting with HTML output.

User Prompt: "${prompt}"

Respond ONLY with the enhanced prompt, nothing else.
Return the response as a JSON object like this:
{
  "prompt": "..."
}
`;

      const aiResponse = await strapi
        .service("api::blog.custom")
        .enhancePrompt(aiPrompt);
      console.log({ aiResponse });
      return (ctx.body = {
        status: "success",
        data: aiResponse,
      });
    } catch (err) {
      ctx.body = err;
    }
  },

  findBySlug: async (ctx, next) => {
    try {
      const { slug } = ctx.params;

      const findBlog = await strapi.documents("api::blog.blog").findFirst({
        filters: {
          Slug: slug,
        },
        status:'published',
        populate: ["Banner_Image", "Category", "Featured_Image", "SEO"],
      });

      ctx.body = findBlog;
    } catch (error) {
      ctx.body = error;
    }
  },
};
