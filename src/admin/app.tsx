import type { StrapiApp } from "@strapi/strapi/admin";
import React, { lazy, Suspense } from "react";
import Logo from "../extensions/logo.png";
export default {
  config: {
    locales: [],
    tutorials: false,
    notifications: {
      releases: false,
    },
    menu: {
      logo: Logo, // Replace with your logo URL
    },
    auth: {
      logo: Logo, // Replace with your logo URL
    },
    head: {
      favicon: Logo, // Replace with your favicon URL
    },
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Scriblog AI", // Replace with your custom name
        "Auth.form.welcome.title": "Welcome to Dashboard", // Replace with your custom name
        "Auth.form.welcome.subtitle": "Log in to your Scriblog AI account", // You can customize this too
        "Auth.form.welcome.login": "Login Scriblog AI",
        "Auth.form.welcome.register": "Sign up",
      },
    },
  },
  bootstrap(app: StrapiApp) {
    console.log({ app });

    const cm = app.getPlugin("content-manager");

    if (cm && cm.injectComponent) {
      const AIButton = lazy(() => import("./components/AIButton"));
     

      cm.injectComponent("listView", "actions", {
        name: "ai-button",
        Component: () => (
          <Suspense fallback={null}>
            <AIButton />
          </Suspense>
        ),
      });
    } else {
      console.warn(
        "Content Manager plugin not found or injectComponent not available"
      );
    }
  },
};
