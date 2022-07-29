const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require('path')


module.exports = {
    mode: process.env.NODE_ENV ? "production" : "development",
    entry: {
        background: path.join(__dirname, "/src/background.ts"),
        content_script: path.join(__dirname, "/src/contents.ts"),
        options: path.join(__dirname, "/src/options.ts")
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts"]
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