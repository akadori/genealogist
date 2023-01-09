import Module from "module";

let originalRequire: typeof Module.prototype.require;

export const on = (
	callback: (parentModule: Module, requiredModulePath: string) => void,
) => {
	originalRequire = Module.prototype.require;
	const wrappedRequire = function (this: Module, requiredModulePath: string) {
		callback(this, requiredModulePath);
		return originalRequire.call(this, requiredModulePath);
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
