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

describe("genealogist", () => {
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
	it("track require graph, and return the ancestors of a module", () => {
		genealogist.watch();
		const { a } = require(`${tempPath}/a.js`);
		genealogist.stop();

		expect(a).toBe(3); // not disturb the original require. Requiring a should be successful.
  
    const cdojsAncestors = [...genealogist.getAncestors(`${tempPath}/c.js`)];
    expect(cdojsAncestors).toContain(`${tempPath}/a.js`);
    expect(cdojsAncestors).toContain(`${tempPath}/b.js`);
    expect(cdojsAncestors).toContain(__filename);
    expect(cdojsAncestors.length).toBe(3);

    const bdojsAncestors = [...genealogist.getAncestors(`${tempPath}/b.js`)];
    expect(bdojsAncestors).toContain(`${tempPath}/a.js`);
    expect(bdojsAncestors).toContain(__filename);
    expect(bdojsAncestors.length).toBe(2);
	});
});
