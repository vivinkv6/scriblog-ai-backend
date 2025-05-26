
const getPreviewPathname = (uid, { locale, document }): string => {
  const { slug } = document;
  
  // Handle different content types with their specific URL patterns
  switch (uid) {
    // Handle blog articles
    case "api::blog.blog":
      if (!slug) {
        return "/blog"; // Blog listing page if no slug
      }
      return `/blog/${slug}`; // Individual blog article page
    default:
      return null; // Return null for unsupported content types
  }
}

export default ({ env }) => {
  const clientUrl = env("CLIENT_URL");
  const previewSecret = env("PREVIEW_SECRET");

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    // preview: {
    //   enabled: true,
    //   config: {
    //     allowedOrigins: clientUrl,
    //     async handler(uid, { documentId, locale, status }) {
    //       const document = await strapi.documents(uid).findOne({ documentId });
    //       const pathname = getPreviewPathname(uid, { locale, document });

    //       if (!pathname) {
    //         return null;
    //       }

    //       const urlSearchParams = new URLSearchParams({
    //         url: pathname,
    //         secret: previewSecret,
    //         status,
    //       });
    //       return `${clientUrl}/api/preview?${urlSearchParams}`;
    //     },
    //   },
    // },
  };
};
