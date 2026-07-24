const CracoLessPlugin = require('craco-less');
const CracoAlias = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'options',
        baseUrl: './',
        aliases: {
          '@': './src',
        },
      },
    },
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              'root-entry-name': 'default',
              'primary-color': '#064e3b',
              'link-color': '#064e3b',
              'border-radius-base': '4px',
              'heading-color': '#064e3b',
              'text-color': '#1a1a1a',
              'text-color-secondary': '#4F5D75',
              'disabled-color': '#BFC0C0',
              'background-color-light': 'rgba(249, 250, 252,1)',
              'background-color-base': 'rgba(249, 250, 252,0.7)',
              'btn-font-weight': '600',
            },
            javascriptEnabled: true,
            relativeUrls: false,
          },
        },
      },
    },
  ],
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
};
