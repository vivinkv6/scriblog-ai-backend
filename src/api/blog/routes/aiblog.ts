export default {
  routes: [
    {
      method: "GET",
      path: "/blogs",
      handler: "custom.fetchAllBlogs",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "POST",
      path: "/blogs/generate",
      handler: "custom.generateBlogByAI",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/blogs/enhance-prompt",
      handler: "custom.enhancePrompt",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/blogs/:slug",
      handler: "custom.findBySlug",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
