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
			},
			{
				test: /\.svg$/i,
				include: rootPath,
				use: {
					loader: "svg-url-loader",
					options: {
						jsx: true // true outputs JSX tags
					}
				}
			},
			{
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
				  {
					loader: 'file-loader',
					options: {
					  name: '[name].[ext]',
					  outputPath: 'fonts/'
					}
				  }
				]
			  }
		]
	},
	devServer: {
		compress: true,
		hot: true,
		port: 4000,
		static: [
			{
				directory: path.join(rootPath, "dist/renderer"),
				publicPath: "/"
			},
			{
				directory: path.join(rootPath, "public"),
				publicPath: "/"
			}
		],
		watchFiles: ['src/**/*.tsx', 'public/**/*', 'src/**/*.scss', 'src/**/*.ts'],
		liveReload: true,
		devMiddleware: {
			writeToDisk: true
		}
	},
	output: {
		path: path.resolve(rootPath, "dist/renderer"),
		filename: "js/[name].js",
		publicPath: "/dist/renderer"
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Password Keeper",
			favicon: "./build/vault.png"
		})
	],
	externals: {
		sqlite3: "commonjs sqlite3"
	}
}
