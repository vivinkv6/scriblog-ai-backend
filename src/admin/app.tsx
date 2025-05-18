import type { StrapiApp } from '@strapi/strapi/admin';
import React, { lazy, Suspense } from 'react';


export default {
  config: {
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    console.log({app});
    
    const cm = app.getPlugin('content-manager');

      if (cm && cm.injectComponent) {
        const AIButton = lazy(() => import('./components/AIButton'));
        
        cm.injectComponent('listView', 'actions', {
          name: 'ai-button',
          Component: () => (
            <Suspense fallback={null}>
              <AIButton />
            </Suspense>
          ),
        });
      } else {
        console.warn('Content Manager plugin not found or injectComponent not available');
      }
  },
};
