interface IVscodeWebview {
	setState: (state: any) => void
	getState: () => any
	postMessage: (msg: any) => void
}

declare function acquireVsCodeApi(): IVscodeWebview
