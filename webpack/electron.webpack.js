const path = require("path")
const fs = require("fs")
const rootPath = path.resolve(__dirname, "..")
const CopyWebpackPlugin = require("copy-webpack-plugin")
/*const WebpackShellPlugin = require("webpack-shell-plugin")*/

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
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "prisma",
					filter: async (resourcePath) =>
						["data.db", "schema.prisma"].includes(
							resourcePath.split("/")[
								resourcePath.split("/").length - 1
							]
						)
				},
				{
					from: "electron/database/generated/client/",
					filter: async (resourcePath) =>
						resourcePath
							.split("/")
							[resourcePath.split("/").length - 1].includes(
								"query-engine-windows.exe"
							)
				}
			]
		})
	]
}
