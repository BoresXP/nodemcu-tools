import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

const commonConfig: webpack.Configuration = {
	target: 'node',
	devtool: 'source-map',
	output: {
		path: path.resolve('out'),
		filename: '[name].js',
		libraryTarget: 'commonjs2',
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
		],
	},
	plugins: [
		new ForkTsCheckerWebpackPlugin({
			typescript: { enabled: true },
			eslint: { enabled: true, files: './src/**/*.{ts,tsx}', options: {} },
			logger: { infrastructure: 'webpack-infrastructure' },
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
			bindings: ['./bindingsProxy', 'bindingsProxy'],
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
