import process from "node:process";
import { getProcessTitle, redent } from "./helpers.ts";
import { parseArguments } from "./parse.ts";
import type { Options, Result, ResultFlags, ValidatedFlags } from "./types.ts";

/**
 * Minimal `meow`-like CLI helper using `util.parseArgs`.
 *
 * - Parses `kebab-case` flags defined in `camelCase`
 * - Supports aliases, short flags, and default values
 * - Parses positional (non-flag) arguments
 * - Automatically supports `--help/-h` and `--version/-v`
 * - Sets the process title to the binary name defined in `package.json`
 *
 * @example
 * ```js
 * #!/usr/bin/env node
 * import mrowki, { log } from "mrowki";
 * import packageJson from "./package.json" with { type: "json" };
 *
 * const cli = mrowki(`
 *   Usage
 *     $ lintr […files]
 *
 *   Options
 *     --help          -h  Show help
 *     --version       -v  Show version
 *     --verbose       -V  Debug log level
 *     --log-level     -L  Set log level (debug, info, warn, error)
 *     --fix, --apply      Fix lints, if possible
 * `, {
 *   pkg: packageJson,
 *   flags: {
 *     verbose: {
 *       shortFlag: "V",
 *       type: "boolean",
 *     },
 *     logLevel: {
 *       type: "string",
 *       default: "info",
 *     },
 *     fix: {
 *       type: "boolean",
 *       aliases: ["apply"],
 *     },
 *   },
 * });
 *
 * const logLevel = cli.flags.verbose ? "debug" : cli.flags.logLevel;
 *
 * // lintr --fix foo.js -V -- bar.js
 * log.info(cli.flags, cli.input);
 * //=> ℹ { fix: true, verbose: true, logLevel: "info" }, ["foo.js", "bar.js"]
 * ```
 */
export function mrowki<const Flags extends ValidatedFlags<Flags>>(
	helpText: string,
	options: Options<Flags>,
): Result<Flags> {
	process.title = getProcessTitle(options.pkg);
	const { input, parsedFlags } = parseArguments(options.flags ?? {});

	if (parsedFlags.version) {
		console.log(options.pkg.version ?? "Unknown version");
		process.exit(0);
	}

	const parsedHelpText = "\n" + redent(helpText, 2);

	// Default to code 2 for incorrect usage
	const showHelp = (code = 2) => {
		console.log(parsedHelpText);
		process.exit(code);
	};

	if (parsedFlags.help) {
		showHelp(0);
	}

	return { flags: parsedFlags as ResultFlags<Flags>, input, showHelp };
}
