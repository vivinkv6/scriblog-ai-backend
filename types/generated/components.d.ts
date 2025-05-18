import type { Schema, Struct } from '@strapi/strapi';

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seos';
  info: {
    displayName: 'SEO';
  };
  attributes: {
    Bottom_Description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    Meta_Description: Schema.Attribute.Text;
    Meta_Keywords: Schema.Attribute.Text;
    Meta_Title: Schema.Attribute.String;
    OG_Description: Schema.Attribute.Text;
    OG_Image: Schema.Attribute.Media<'images' | 'files'>;
    OG_Title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'seo.seo': SeoSeo;
    }
  }
}
