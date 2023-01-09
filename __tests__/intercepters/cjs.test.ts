import { expect, describe, it, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";

import { on, off } from "../../src/intercepters/requireIntercepter";

const cdotjs = `
    const c= 1;
    exports.c= c;
`;

const bdotjs = `
    const { c } = require('./c.js');
    const b = 2;
    exports.b = b;
`;

const adotjs = `
    const { b } = require('./b.js');
    const { c } = require('./c.js');
    const a = 3;
    exports.a = a;
`;

const tempPath = path.join(__dirname, "temp");

describe("requireIntercepter", () => {
	beforeAll(() => {
		fs.mkdirSync(tempPath);
		fs.writeFileSync(`${tempPath}/c.js`, cdotjs);
		fs.writeFileSync(`${tempPath}/b.js`, bdotjs);
		fs.writeFileSync(`${tempPath}/a.js`, adotjs);
	});
	afterAll(() => {
		const tempPath = path.join(__dirname, "temp");
		fs.rmSync(tempPath, { recursive: true, force: true });
	});
	it("intercepts require", () => {
		let temp: Array<string> = [];
		on((requiredModulePath, parentModulePath) => {
			temp.push(requiredModulePath);
			temp.push(parentModulePath);
		});
		const { a } = require(`${tempPath}/a.js`);
		off();
		expect(a).toBe(3);
		// eslint-disable-next-line no-console
		console.log(`temp: ${JSON.stringify(temp)}`);
		expect(temp).toEqual([
			`${tempPath}/c.js`,
			`${tempPath}/b.js`,
			`${tempPath}/b.js`,
			`${tempPath}/a.js`,
		]);
	});
});
