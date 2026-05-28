const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  // Main entry points
  entry: {
    main: "./src/wordpress/widget/indexWidget.wordpress.tsx",
    dashboard: "./src/wordpress/dashboard/indexDashboard.wordpress.tsx",
  },

  // Build output
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../assets"),
    clean: true,
  },

  module: {
    rules: [
      // TypeScript / React
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },

      // SVG support
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              prettier: false,
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
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
          "url-loader",
        ],
      },

      // Static images
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]",
        },
      },

      // CSS processing
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "postcss.config.cjs"),
              },
            },
          },
        ],
      },
    ],
  },

  // Resolvable extensions
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  // Keep output readable
  optimization: {
    minimize: false,
    minimizer: [],
  },

  plugins: [
    // Extract CSS files
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),

    // Copy static assets
    new CopyPlugin({
      patterns: [
        {
          from: "./src/images/logos/Logo.svg",
          to: "Logo.svg",
        },
        {
          from: "./src/images/wizy_chat_profile.png",
          to: "wizy_chat_profile.png",
        },
        {
          from: "./src/images/wizy_curvy_border.png",
          to: "wizy_curvy_border.png",
        },
        {
          from: "./src/images/wizy_logo_blue.svg",
          to: "wizy_logo_blue.svg",
        },
        {
          from: "./src/images/wizy_no_image_available.png",
          to: "wizy_no_image_available.png",
        },
        {
          from: "./src/images/wizy_widget_loader.svg",
          to: "wizy_widget_loader.svg",
        },
        {
          from: "./public/ShopifyWidgetInner.css",
          to: "ShopifyWidgetInner.css",
        },
        {
          from: "./public/ShopifyWidgetOutter.css",
          to: "ShopifyWidgetOutter.css",
        },
      ],
    }),
  ],
};
