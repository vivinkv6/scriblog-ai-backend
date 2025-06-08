/**
 * A set of functions called "actions" for `custom`
 */

export default {
  fetchAllCategories: async (ctx, next) => {
    try {
      const { page = 1, limit = 10 } = ctx.query;

      const skip = (page - 1) * limit;

      const [fetchCategories, count] = await Promise.all([
        strapi.documents("api::category.category").findMany({
          start: skip,
          limit: limit,
          populate: ["Image", "Blogs"],
          sort: ["createdAt:desc"],
          status: "published",
        }),
        strapi
          .documents("api::category.category")
          .count({ status: "published" }),
      ]);

      ctx.status = 200;
      ctx.body = {
        data: fetchCategories,
        meta: {
          pagination: {
            page: Number(page),
            pageSize: Number(limit),
            pageCount: Math.ceil(count / limit),
            total: count,
          },
        },
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = err;
    }
  },

  findCategoryBySlug: async (ctx, next) => {
    try {
      const { slug } = ctx.params;

      const findCategory = await strapi
        .documents("api::category.category")
        .findFirst({
          filters: {
            Slug: slug,
          },
          populate: ["Blogs", "Image"],
          status: "published",
        });

      if (!findCategory) {
        ctx.status = 404;
        ctx.body = {
          data: findCategory,
        };

        return;
      }

      ctx.status = 200;
      ctx.body = {
        data: findCategory,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = error;
    }
  },
};
