const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const rootPath = path.resolve(__dirname, "..")

module.exports = {
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		mainFields: ["main", "module", "browser"],
		alias: {
			"@": path.resolve(rootPath, "src"),
			"components": path.resolve(rootPath, "src/components"),
			"apps": path.resolve(rootPath, "src/components"),
			"reducers": path.resolve(rootPath, "src/reducers"),
			"providers": path.resolve(rootPath, "src/providers"),
			"enums": path.resolve(rootPath, "src/enums.ts"),
			"icons": path.resolve(rootPath, "src/icons/index.tsx"),
		}
	},
	entry: path.resolve(rootPath, "src", "App.tsx"),
	target: "electron-renderer",
	watch: true,
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
		//hot: true,
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
		},
		client: {
			progress: true
		}
	},
	output: {
		path: path.resolve(rootPath, "dist/renderer"),
		filename: "js/[name].js",
		publicPath: "./",
		hotUpdateChunkFilename: "HOTjs/hot-update.js",
		hotUpdateMainFilename: "HOTjs/hot-update.json",
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Password Keeper",
			favicon: "./build/vault.png",
			alwaysWriteToDisk: true,
			filename: "index.html",
		})
	],
	externals: {
		sqlite3: "commonjs sqlite3"
	}
}
