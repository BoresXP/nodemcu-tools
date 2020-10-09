import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

const config: webpack.Configuration = {
	target: 'node',
	entry: './src/extension.ts',
	output: {
		path: path.resolve('out'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2',
	},
	devtool: 'source-map',
	externals: {
		vscode: 'commonjs vscode',
		serialport: 'serialport',
	},
	resolve: {
		extensions: ['.ts'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
				},
			},
		],
	},
	plugins: [new ForkTsCheckerWebpackPlugin({ typescript: { enabled: true }, eslint: { files: './src/**/*.ts' } })],
}

export default config
