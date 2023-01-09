import Module from "module";

let originalRequire: typeof Module.prototype.require;

export const on = (
	callback: (requiredModulePath: string, parentModulePath: string) => void,
) => {
	originalRequire = Module.prototype.require;
	const wrappedRequire = function (this: Module, request: string) {
		//@ts-ignore to get the absolute path of the module
		const absolutePath = Module._resolveFilename(request, this);
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
	Module.prototype.require = originalRequire || Module.prototype.require;
};
