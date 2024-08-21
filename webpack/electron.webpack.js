const path = require("path")
const nodeExternals = require("webpack-node-externals")
const CopyPlugin = require("copy-webpack-plugin")

const rootPath = path.resolve(__dirname, "..")

module.exports = {
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		alias: {
			"@shared": path.resolve(rootPath, "src/shared/"),
		}
	},
	entry: {
		main: path.resolve(rootPath, "src", "backend", "main.ts"),
		preload: path.resolve(rootPath, "src", "backend", "preload.ts")
	},
	target: "electron-main",
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)$/,
				exclude: /node_modules+/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	},
	externals: [nodeExternals(), "sqlite3"],
	node: {
		__dirname: false
	},
	output: {
		path: path.resolve(rootPath, "dist"),
		filename: "[name].js"
	},
	plugins: [
		/*new CopyPlugin({
			patterns: [{ from: "electron/preload.js", to: "preload.js" }]
		})*/
	]
}
