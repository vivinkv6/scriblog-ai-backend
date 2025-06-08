export default {
  routes: [
    {
      method: "GET",
      path: "/home",
      handler: "custom.find",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
