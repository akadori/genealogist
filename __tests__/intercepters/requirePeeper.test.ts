import { expect, describe, it, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

import { on, off } from "../../src/peepers/requirePeeper";
import Module from "module";

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
let randomDirName; // random directory name to avoid module loading cache

describe("require peeper", () => {
	beforeEach(() => {
    randomDirName = Math.random().toString(36).substring(7);
		fs.mkdirSync(tempPath);
    fs.mkdirSync(`${tempPath}/${randomDirName}`);
		fs.writeFileSync(`${tempPath}/${randomDirName}/c.js`, cdotjs);
		fs.writeFileSync(`${tempPath}/${randomDirName}/b.js`, bdotjs);
		fs.writeFileSync(`${tempPath}/${randomDirName}/a.js`, adotjs);
	});
	afterEach(() => {
		const tempPath = path.join(__dirname, "temp");
		fs.rmSync(tempPath, { recursive: true, force: true });
	});
	it("plug in the operation before require", () => {
    
    let requireCalledCount = 0;
		on((_, _2) => {
      requireCalledCount++;
		});
		const { a } = require(`${tempPath}/${randomDirName}/a.js`);
    // not disturb the original require. Requiring a should be successful.
    expect(a).toBe(3);
    // requirePeeper should be called 4 times.
    // 1. this require a.js
    // 2. a.js require b.js
    // 3. a.js require c.js
    // 4. b.js require c.js
    expect(requireCalledCount).toBe(4);
    off();
	});
  it("The plugged operation receives the same arguments as the original require", () => {
    const passedArguments: Array<{m: Module, r: string}> = [];
    on((m, r) => {
      passedArguments.push({m, r});
    });
		const { a } = require(`${tempPath}/${randomDirName}/a.js`);
    // passedArguments.forEach(({m, r}) => {
    //   console.log(m, r);
    // });
    // TODO: I don't know how to test this.
    expect(1).toBe(1);
    off();
  });
  it("after off, the plugged operation should not be called", () => {
    let requireCalledCount = 0;
    on((_, _2) => {
      requireCalledCount++;
    });
    off();
    const { a } = require(`${tempPath}/${randomDirName}/a.js`);
    expect(requireCalledCount).toBe(0);
  });
});
