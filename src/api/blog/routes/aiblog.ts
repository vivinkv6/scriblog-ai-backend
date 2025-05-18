export default {
  routes: [
    {
      method: 'POST',
      path: '/blog/generate',
      handler: 'custom.generateBlogByAI',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'POST', 
      path: '/blog/enhance-prompt',
      handler: 'custom.enhancePrompt',
      config: {
        policies: [],
        auth: false,
      }
    },
  
  ]
}
