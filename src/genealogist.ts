import { on, off } from "./intercepters/requireIntercepter";

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
		on((absolutePath: string, parentPath: string) => {
			if (this.ignorePatternsRegex.test(absolutePath)) {
				return;
			}
			if (!this.requiredToRequiers.has(absolutePath)) {
				this.requiredToRequiers.set(absolutePath, []);
			}
			this.requiredToRequiers.get(absolutePath)!.push(parentPath);
		});
	}

	getRequiredBy(absolutePath: string): Array<string> {
		return this.requiredToRequiers.get(absolutePath) || [];
	}

	stop() {
		off();
	}

	getRequiredToRequiers() {
		return this.requiredToRequiers;
	}
}
