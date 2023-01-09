import { expect, describe, it, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";

import { Genealogist } from "../src/genealogist";

const dummyNodeModuleIndex = `
    const dummy = 4;
    exports.dummy = dummy;
`;

const dummyPackageJson = `
    {
        "name": "dummy",
        "main": "index.js"
    }
`;


const cdotjs = `
    const dummy = require('dummy');
    const resolved = require.resolve('dummy');
    const c= 1;
    module.exports = {
      resolvedDummyModulePath: resolved,
      c,
    };
`;

const bdotjs = `
    const { c } = require('./c.js');
    const b = 2;
    exports.b = b;
`;

const adotjs = `
    const { b } = require('./b.js');
    const { c, resolvedDummyModulePath } = require('./c.js');
    const a = 3;
    module.exports = {
      a,
      resolvedDummyModulePath,
    }
`;

const tempPath = path.join(__dirname, "temp");


describe("genealogist", () => {
	beforeAll(() => {
		fs.rmSync(tempPath, { recursive: true, force: true });
		fs.mkdirSync(tempPath);
		fs.writeFileSync(`${tempPath}/c.js`, cdotjs);
		fs.writeFileSync(`${tempPath}/b.js`, bdotjs);
		fs.writeFileSync(`${tempPath}/a.js`, adotjs);
    
    fs.mkdirSync(`${tempPath}/node_modules`);
    fs.mkdirSync(`${tempPath}/node_modules/dummy`);    fs.writeFileSync
    (`${tempPath}/node_modules/dummy/index.js`, dummyNodeModuleIndex);
  fs.writeFileSync
    (`${tempPath}/node_modules/dummy/package.json`, dummyPackageJson);

	});
	afterAll(() => {
		fs.rmSync(tempPath, { recursive: true, force: true });
	});
	it("track require graph, and return the ancestors of a module", () => {
    const genealogist = new Genealogist();
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
  it("not track node_modules, if ignorePatterns was not set", () => {
    const genealogist = new Genealogist();
    genealogist.watch();
    const { resolvedDummyModulePath } = require(`${tempPath}/a.js`);
    genealogist.stop();
    const dummyAncestors = [...genealogist.getAncestors(resolvedDummyModulePath)];
    expect(dummyAncestors.length).toBe(0);    
  });
});
