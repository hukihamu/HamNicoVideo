const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require('path')
const {TsconfigPathsPlugin} = require('tsconfig-paths-webpack-plugin')


module.exports = {
    mode: process.env.NODE_ENV ? "production" : "development",
    entry: {
        background: path.join(__dirname, "/src/background.ts"),
        content_script: path.join(__dirname, "/src/content_script.ts"),
        options: path.join(__dirname, "/src/options.ts")
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/i,
                loader: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts"],
        plugins: [new TsconfigPathsPlugin({ configFile: path.join(__dirname, "tsconfig.json") })]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: ".", to: ".", context: "public" }]
        })
    ],
    watchOptions: {
        ignored: /node_modules/
    }
}