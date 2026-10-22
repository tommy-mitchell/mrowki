import process from "node:process";
import { parseArgs, type ParseArgsConfig, type ParseArgsOptionsConfig } from "node:util";
import { camelCase, kebabCase } from "./helpers.ts";
import * as log from "./log.ts";
import type { AnyFlags, ResultFlagsWithHelpAndVersion } from "./types.ts";

const safeParseArgs = (config: ParseArgsConfig): ReturnType<typeof parseArgs> => {
	try {
		return parseArgs(config);
	} catch (error) {
		const code = (error as NodeJS.ErrnoException)?.code;

		if (error instanceof Error && (code === "ERR_INVALID_ARG_TYPE" || code?.startsWith("ERR_PARSE_ARGS_"))) {
			if (code === "ERR_PARSE_ARGS_INVALID_OPTION_VALUE") {
				const flag = error.message.match(/'--(?<flag>\S+)'/v)?.groups?.["flag"];

				if (flag && config.options?.[flag]?.type === "boolean") {
					log.error(error.message + `. Use '--no-${flag}' for negation.`);
					process.exit(1);
				}
			}

			log.error(error.message.replace("\"options.", "\""));
			process.exit(1);
		}

		throw error;
	}
};

export const parseArguments = <Flags extends AnyFlags>(flags: Flags) => {
	flags = {
		help: { shortFlag: "h", type: "boolean" },
		version: { shortFlag: "v", type: "boolean" },
		...flags,
	};

	// Separate aliases for the parser
	const parserFlags = Object.fromEntries(
		Object.entries(flags).flatMap(([key, { aliases = [], shortFlag: short, ...flag }]) =>
			[...aliases, key].map(f => [kebabCase(f), { ...flag, ...(short && { short }) }] as const)
		),
	) satisfies ParseArgsOptionsConfig;

	const { positionals: input, values } = safeParseArgs({
		allowNegative: true,
		allowPositionals: true,
		args: process.argv.slice(2),
		options: parserFlags,
	});

	const flagMap = new Map();
	const aliasMap = new Map(
		Object.entries(flags).flatMap(([key, { aliases = [] }]) => aliases.map((alias) => [alias, key])),
	);

	// Collate aliases using input order
	for (const [key, flag] of Object.entries(values)) {
		const mainKey = aliasMap.get(key) ?? key;
		flagMap.set(camelCase(mainKey), flag);
	}

	return {
		input,
		parsedFlags: Object.fromEntries(flagMap) as ResultFlagsWithHelpAndVersion<Flags>,
	};
};
