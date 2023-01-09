import Module from "module";
import { on, off } from "./peepers/requirePeeper";

export const DEFAULT_IGNORE_PATTERNS = ["node_modules"];

export class Genealogist {
	private ignorePatternsRegex: RegExp;
	private requiredToRequiers: Map<string, Array<string>> = new Map();

	constructor(options: { ignorePatterns?: Array<string> } = {}) {
		const ignorePatterns = options.ignorePatterns || DEFAULT_IGNORE_PATTERNS;
		this.ignorePatternsRegex = new RegExp(
			ignorePatterns.map((pattern) => `(${pattern})`).join("|"),
		);
	}

	watch() {
		on((parentModule: Module, requiredModulePath: string) => {
      //@ts-ignore to get the absolute path of the module
      const absolutePath: string = Module._resolveFilename(requiredModulePath, parentModule);
			if (this.ignorePatternsRegex.test(absolutePath)) {
				return;
			}
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
