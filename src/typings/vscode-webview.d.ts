interface IVscodeWebview {
	setState: (state: Record<string, unknown>) => void
	getState: () => Record<string, unknown>
	postMessage: (msg: any) => void
}

declare function acquireVsCodeApi(): IVscodeWebview
