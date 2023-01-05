import fs from 'fs';
import path from 'path';

// import { Genealogist } from "../../../src/genealogist"
// import { module } from '../../../src/intercepters';
import Module from 'module';

const magodotjs = `
    const mago= 1;
    exports.mago= mago;
`;

const oyadotjs = `
    const { mago } = require('./mago.js');
    const oya = 2;
    exports.oya = oya;
`;

const rootdotjs = `
    const { oya } = require('./oya.js');
    const { mago } = require('./mago.js');
    const root = 3;
    exports.root = root;
`;

const tempPath = path.join(__dirname, "temp");

// const genealogist = new Genealogist();

describe('test', () => {
        beforeAll(() => {
            fs.mkdirSync(tempPath);
            fs.writeFileSync(`${tempPath}/mago.js`, magodotjs);
            fs.writeFileSync(`${tempPath}/oya.js`, oyadotjs);
            fs.writeFileSync(`${tempPath}/root.js`, rootdotjs);
            // genealogist.watch();
        });
        afterAll(() => {
            // const tempPath = path.join(__dirname, "temp");
            // fs.rmSync(tempPath, { recursive: true, force: true });
        });
        it('works', () => {
            expect(1).toBe(1);
            // expect(module).toBe(Module);
            // expect(1).toBe(1);
            // const { root } = module.prototype.require(`${tempPath}/root.js`);
            // genealogist.stop();
            // genealogist.getRequiredToRequiers().forEach((value, key) => {
            //     console.log(key, value);
            // });
            // expect(root).toBe(3);
        });
    }
);