const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');

// Read ngrok.env
let ngrokDomain = '';
let wpLocalUrl = 'https://localhost:3004';
try {
  const envPath = path.resolve(__dirname, 'ngrok.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NGROK_DOMAIN=(.*)/);
    if (match && match[1]) {
      ngrokDomain = match[1].trim();
    }
  }
} catch (e) {
  console.warn('Could not read ngrok.env', e);
}

if (ngrokDomain === '') {
  throw new Error('NGROK_DOMAIN is not defined');
}

module.exports = {
  entry: {
    main: './src/wordpress/widget/indexWidget.wordpress.tsx',
    dashboard: './src/wordpress/dashboard/indexDashboard.wordpress.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(
      __dirname,
      './tjlabs-wizybot-wordpress-extension/extensions/chat-extemsion/assets',
    ),
    clean: true,
  },
  stats: {
    all: false,
    assets: true,
    entrypoints: true,
    modules: true,
    nestedModules: true,
    reasons: true,
    moduleTrace: true,
    dependentModules: true,
    outputPath: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              prettier: false,
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
              titleProp: true,
            },
          },
          'url-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, 'postcss.config.cjs'),
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: false,
    minimizer: [],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css', // This will generate main.css and dashboard.css
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './src/images/logos/Logo.svg',
          to: 'Logo.svg',
        },
        {
          from: './src/images/wizy_chat_profile.png',
          to: 'wizy_chat_profile.png',
        },
        {
          from: './src/images/wizy_curvy_border.png',
          to: 'wizy_curvy_border.png',
        },
        {
          from: './src/images/wizy_logo_blue.svg',
          to: 'wizy_logo_blue.svg',
        },
        {
          from: './src/images/wizy_no_image_available.png',
          to: 'wizy_no_image_available.png',
        },
        {
          from: './src/images/wizy_widget_loader.svg',
          to: 'wizy_widget_loader.svg',
        },
        {
          from: './public/ShopifyWidgetInner.css',
          to: 'ShopifyWidgetInner.css',
        },
        {
          from: './public/ShopifyWidgetOutter.css',
          to: 'ShopifyWidgetOutter.css',
        },
        {
          from: 'ngrok.env',
          to: 'ngrok.php',
          noErrorOnMissing: true,
          transform(content, path) {
            return `<?php define('NGROK_DOMAIN_WEBPACK', '${ngrokDomain}'); define('WP_LOCAL_URL_WEBPACK', '${wpLocalUrl}'); ?>`;
          },
        },
      ],
    }),
  ],
};
