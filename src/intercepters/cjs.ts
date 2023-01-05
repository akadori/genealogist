import Module from "module";

const originalRequire = Module.prototype.require;

export const on = (
	callback: (absolutePath: string, parent: string) => void,
) => {
	// eslint-disable-next-line no-console
	console.log("on called");
	const wrappedRequire = function (this: Module, request: string) {
		// eslint-disable-next-line no-console
		console.log("wrappedRequire called");
		//@ts-ignore to get the absolute path of the module
		const absolutePath = Module._resolveFilename(request, this);
		// eslint-disable-next-line no-console
		console.log(`this.filename: ${JSON.stringify(this.filename)}`);
		// eslint-disable-next-line no-console
		console.log(`absolutePath: ${JSON.stringify(absolutePath)}`);
		callback(absolutePath, this.filename);
		return originalRequire.call(this, request);
	};
	wrappedRequire.resolve = originalRequire.resolve;
	wrappedRequire.cache = originalRequire.cache;
	wrappedRequire.extensions = originalRequire.extensions;
	wrappedRequire.main = originalRequire.main;
	Module.prototype.require = wrappedRequire;
};

export const off = () => {
	Module.prototype.require = originalRequire;
};

export const module = Module;