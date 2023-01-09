import Module from "module";
import { on, off } from "./peepers/requirePeeper";
import isBuiltinModule from "is-builtin-module"; // TODO: Use builtin module.isBuiltinModule when it is available, Added in: v18.6.0, v16.17.0

export const DEFAULT_IGNORE_PATTERNS = ["node_modules"];

export class Genealogist {
	private ignorePatternsRegex: RegExp;
	private includeBuiltInModules: boolean;
	private requiredToRequiers: Map<string, Array<string>> = new Map();

	constructor(
		options: {
			ignorePatterns?: Array<string>;
			includeBuiltInModules?: boolean;
		} = {},
	) {
		const ignorePatterns = options.ignorePatterns || DEFAULT_IGNORE_PATTERNS;
		this.ignorePatternsRegex = new RegExp(
			ignorePatterns.map((pattern) => `(${pattern})`).join("|"),
		);
    this.includeBuiltInModules = options.includeBuiltInModules || false;
	}

	watch() {
		on((parentModule: Module, requiredModulePath: string) => {
			if (this.ignorePatternsRegex.test(requiredModulePath)) {
				return;
			}
      if (!this.includeBuiltInModules && isBuiltinModule(requiredModulePath)) {
        return;
      }
			//@ts-ignore to get the absolute path of the module
			const absolutePath: string = Module._resolveFilename(
				requiredModulePath,
				parentModule,
			);
			if (!this.requiredToRequiers.has(absolutePath)) {
				this.requiredToRequiers.set(absolutePath, []);
			}
			this.requiredToRequiers.get(absolutePath)!.push(parentModule.filename);
		});
	}

	getAncestors(modulePath: string) {
		const ancestors = new Set<string>();
		const queue = [modulePath];
		while (queue.length) {
			const current = queue.shift()!;
			const requiredModules = this.requiredToRequiers.get(current);
			if (requiredModules) {
				requiredModules.forEach((requiredModule) => {
					if (!ancestors.has(requiredModule)) {
						ancestors.add(requiredModule);
						queue.push(requiredModule);
					}
				});
			}
		}
		return ancestors;
	}

	stop() {
		off();
	}
}
