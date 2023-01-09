import { build, BuildOptions } from "esbuild";
import { globbySync } from "globby";

const entryPoints = globbySync("./src/**/**.{ts,tsx}");

const options: BuildOptions = {
	entryPoints,
	target: "node14.11",
	platform: "node",
	format: "cjs",
	outdir: "dist",
};

if (process.env.WATCH === "true") {
	options.watch = {
		onRebuild(error, result) {
			if (error) {
				console.error("watch build failed:", error);
			} else {
				console.log("watch build succeeded:", result);
			}
		},
	};
}

build(options).catch((err) => {
	process.stderr.write(err.stderr);
	process.exit(1);
});
