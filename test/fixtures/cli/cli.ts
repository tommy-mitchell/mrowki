#!/usr/bin/env node
import mrowki from "../../../src/index.ts";
import packageJson from "./package.json" with { type: "json" };

// dprint-ignore
const cli = mrowki(`
	Usage
	  $ lintr […files]

	Options
	  --help          -h  Show help
	  --version       -v  Show version
	  --verbose       -V  Debug log level
	  --log-level     -L  Set log level (debug, info, warn, error)
	  --fix, --apply      Fix lints, if possible
`, {
	pkg: packageJson,
	flags: {
		verbose: {
			shortFlag: "V",
			type: "boolean",
		},
		logLevel: {
			type: "string",
			default: "info",
		},
		fix: {
			type: "boolean",
			aliases: ["apply"],
		},
	},
});

console.log("flags:", cli.flags);
console.log("input:", cli.input);
