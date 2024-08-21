const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin");

const rootPath = path.resolve(__dirname, "..")

module.exports = {
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		mainFields: ["main", "module", "browser"],
		alias: {
			"@components": path.resolve(rootPath, "src/frontend/components/"),
			"@apps": path.resolve(rootPath, "src/frontend/components/"),
			"@reducers": path.resolve(rootPath, "src/frontend/reducers/"),
			"@providers": path.resolve(rootPath, "src/frontend/providers/"),
			"@shared": path.resolve(rootPath, "src/shared/"),
		}
	},
	entry: path.resolve(rootPath, "src", "frontend" ,"App.tsx"),
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
		watchFiles: ['src/frontend/**/*.tsx', 'public/**/*', 'src/frontend/**/*.scss', 'src/frontend/**/*.ts'],
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
		}),
		new CopyWebpackPlugin({
			patterns: [
                {
                    from: path.resolve(rootPath, "public"),
                    to: path.resolve(rootPath, "dist/renderer"),
                },
            ],
		})
	],
	externals: {
		sqlite3: "commonjs sqlite3"
	}
}
