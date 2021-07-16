const path = require("path")
const fs = require("fs")
const rootPath = path.resolve(__dirname, "..")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	entry: path.resolve(rootPath, "electron", "main.ts"),
	target: "electron-main",
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	},
	node: {
		__dirname: false
	},
	output: {
		path: path.resolve(rootPath, "dist"),
		filename: "[name].js"
	},
	externals: {
		sqlite3: "commonjs sqlite3"
	}
}
