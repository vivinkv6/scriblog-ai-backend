/**
 * A set of functions called "actions" for `custom`
 */

export default {
  find: async (ctx, next) => {
    try {
      const homePage = await strapi.documents("api::home.home").findFirst({
        populate: ["Featured_Blogs","Featured_Blogs.Banner_Image", "SEO", "SEO.OG_Image"], 
        status: "published",
      });

      ctx.status = 200;
      ctx.body = {  
        data: homePage,
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = err;
    }
  },
};
