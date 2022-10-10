const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const rootPath = path.resolve(__dirname, "..")

module.exports = {
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		mainFields: ["main", "module", "browser"]
	},
	entry: path.resolve(rootPath, "src", "App.tsx"),
	target: "electron-renderer",
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.s[ac]ss$/i,
				use: ["style-loader", "css-loader", "sass-loader"]
			}
		]
	},
	devServer: {
		contentBase: path.join(rootPath, "dist/renderer"),
		historyApiFallback: true,
		compress: true,
		hot: true,
		host: "0.0.0.0",
		port: 4000,
		publicPath: "/"
	},
	output: {
		path: path.resolve(rootPath, "dist/renderer"),
		filename: "js/[name].js",
		publicPath: "./"
	},
	plugins: [new HtmlWebpackPlugin({
		title: "Password Keeper"
	})],
	externals: {
		sqlite3: "commonjs sqlite3"
	}
}
