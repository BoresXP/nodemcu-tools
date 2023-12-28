import CopyPlugin from 'copy-webpack-plugin'
import ESLintWebpackPlugin from 'eslint-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
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
			patterns: [{ from: 'src/task/nodemcutools-schema.json', to: './' }],
		}),
	],
}

const config: webpack.Configuration[] = [
	{
		...commonConfig,
		entry: {
			bindingsProxy: './src/bindingsProxy.ts',
		},
		externals: {
			vscode: 'commonjs vscode',
		},
	},
	{
		...commonConfig,
		entry: {
			extension: './src/extension.ts',
		},
		externals: {
			vscode: 'commonjs vscode',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'node-gyp-build': './bindingsProxy',
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
