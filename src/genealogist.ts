import { on, off } from "./intercepters/cjs";
const requiredToRequiers: Map<string, Array<string>> = new Map();

export class Genealogist {
	constructor() {}
	watch() {
        // eslint-disable-next-line no-console
        console.log("watching");
		on((absolutePath: string, parentPath: string) => {
			if (!requiredToRequiers.has(absolutePath)) {
				requiredToRequiers.set(absolutePath, []);
			}
			requiredToRequiers.get(absolutePath)!.push(parentPath);
		});
	}

	getRequiredBy(absolutePath: string): Array<string> {
		return requiredToRequiers.get(absolutePath) || [];
	}

	stop() {
		off();
	}

    getRequiredToRequiers() {
        return requiredToRequiers;
    }
}
