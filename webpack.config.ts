import CopyPlugin from 'copy-webpack-plugin'
import ESLintWebpackPlugin from 'eslint-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import JsonMinimizerPlugin from 'json-minimizer-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

const commonConfig: webpack.Configuration = {
	target: 'node',
	devtool: 'source-map',
	output: {
		path: path.resolve('out'),
		filename: '[name].js',
		library: {
			type: 'commonjs2',
		},
	},
	resolve: {
		extensions: ['.wasm', '.mjs', '.js', '.json', '.ts'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
				},
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	plugins: [
		new ForkTsCheckerWebpackPlugin({
			logger: 'webpack-infrastructure',
		}),
		new ESLintWebpackPlugin({
			files: './src/**/*.{ts,tsx}',
		}),
		new CopyPlugin({
			patterns: [
				{ from: path.resolve(__dirname, 'src/task/nodemcutools-schema.json'), to: path.resolve(__dirname, './out') },
				{
					from: path.resolve(__dirname, './node_modules/@serialport/bindings-cpp/prebuilds/darwin-x64+arm64'),
					to: path.resolve(__dirname, './prebuilds/darwin-x64+arm64'),
				},
				{
					from: path.resolve(__dirname, './node_modules/@serialport/bindings-cpp/prebuilds/linux-x64'),
					to: path.resolve(__dirname, './prebuilds/linux-x64'),
				},
				{
					from: path.resolve(__dirname, './node_modules/@serialport/bindings-cpp/prebuilds/win32-x64'),
					to: path.resolve(__dirname, './prebuilds/win32-x64'),
				},
			],
		}),
	],
	optimization: {
		minimizer: [new JsonMinimizerPlugin(), '...'],
	},
}

const config: webpack.Configuration[] = [
	{
		...commonConfig,
		entry: {
			extension: './src/extension.ts',
		},
		externals: {
			vscode: 'commonjs vscode',
		},
	},
	{
		...commonConfig,
		target: 'web',
		entry: {
			terminal: './src/terminal/content/index.tsx',
		},
		output: {
			path: path.resolve('out'),
			filename: '[name].js',
		},
		resolve: {
			extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx'],
		},
	},
]

export default config
