import { expect, describe, it, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";

import { Genealogist } from "../src/genealogist";

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

const genealogist = new Genealogist();

describe("test", () => {
	beforeAll(() => {
		fs.mkdirSync(tempPath);
		fs.writeFileSync(`${tempPath}/c.js`, cdotjs);
		fs.writeFileSync(`${tempPath}/b.js`, bdotjs);
		fs.writeFileSync(`${tempPath}/a.js`, adotjs);
		genealogist.watch();
	});
	afterAll(() => {
		const tempPath = path.join(__dirname, "temp");
		fs.rmSync(tempPath, { recursive: true, force: true });
	});
	it("works", () => {
		const { a } = require(`${tempPath}/a.js`);
		genealogist.stop();
		genealogist.getRequiredToRequiers().forEach((value, key) => {
			console.log(key, value);
		});
		expect(a).toBe(3);
	});
});
