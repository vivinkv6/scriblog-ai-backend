"use strict";

export default {
  routes: [
    {
      method: "GET",
      path: "/categories",
      handler: "custom.fetchAllCategories",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/categories/:slug",
      handler: "custom.findCategoryBySlug",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
