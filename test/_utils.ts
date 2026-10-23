/* eslint-disable ava/no-ignored-test-files -- helper */
import { fileURLToPath } from "node:url";
import test from "ava";
import { parseCommandString, serializeAnsi } from "@tommy-mitchell/test-helpers";
import * as tq from "test-quadruple";
import type { AnyFlags, PackageJsonLike } from "#src/types.ts";

export const atFixture = (name: string) => fileURLToPath(new URL(`fixtures/${name}`, import.meta.url));

export const getLogs = (logger: tq.AnyFunction): string => (
	serializeAnsi(tq.explain(logger).calls.map(call => call.arguments.join(" ")).join("\n"))
);

const tryCatch = <T>(fn: () => T): { data: T; error?: never; } | { data?: never; error: unknown; } => {
	try {
		return { data: fn() };
	} catch (error) {
		return { error };
	}
};

// eslint-disable-next-line unicorn/consistent-boolean-name
export const replace = async (args = "", unicode = true) => {
	const logger = tq.spy();
	const consoleReplacement = { import: { console: { error: logger, log: logger } } };

	const exit = tq.spy(tq.throws(EXIT_SYMBOL));
	const setTitle = tq.spy(tq.noop());

	const processReplacement = { exit, argv: ["", "", ...parseCommandString(args)], env: {} };
	Object.defineProperty(processReplacement, "title", { set: setTitle }); // eslint-disable-line accessor-pairs

	const { mrowki } = await tq.replace<typeof import("#src/main.ts")>({
		globalMocks: {
			...consoleReplacement,
			"node:process": { default: processReplacement, ...processReplacement },
		},
		importMeta: import.meta,
		modulePath: "#src/main.ts",
	});

	const log = await tq.replace<typeof import("#src/log.ts")>({
		globalMocks: consoleReplacement,
		importMeta: import.meta,
		// TODO: replace with packageMocks, #src/index.ts
		localMocks: { "is-unicode-supported": () => unicode },
		modulePath: "#src/log.ts",
	});

	return { mrowki, log, spies: { exit, logger, setTitle }, logs: () => getLogs(logger) };
};

type VerifyMacroArgs = [{
	args: string;
	expected: Partial<{
		exitCode: number;
		flags: Record<string, boolean | string | undefined>;
		input: string[];
		message: string;
		title: string;
	}>;
	flags?: AnyFlags;
	help?: string;
	pkg?: PackageJsonLike;
}];

export const EXIT_SYMBOL = Symbol("exit");

/* eslint-disable ava/no-conditional-assertion -- useful in macros */
export const verify = test.macro<VerifyMacroArgs>(async (
	t,
	{ args, expected, flags, help = "Usage…", pkg = { name: "foo-cli" } },
) => {
	const { mrowki, spies: { exit, logger, setTitle }, logs } = await replace(args);

	const maybeCli = tryCatch(() => mrowki(help, { flags, pkg }));

	if (expected.message !== undefined) {
		const assertions = await t.try(tt => {
			tt.log("logs:", tq.explain(logger).flatCalls);
			tt.is(logs(), expected.message!);
		});

		assertions.commit({ retainLogs: !assertions.passed });
	}

	if (expected.title !== undefined) {
		t.like(tq.explain(setTitle), {
			callCount: 1,
			flatCalls: [expected.title],
		});
	}

	if (Object.hasOwn(maybeCli, "error")) {
		const { called, callCount, flatCalls: [exitCode] } = tq.explain(exit); // eslint-disable-line unicorn/no-unreadable-object-destructuring

		if (expected.exitCode === undefined) {
			t.false(called, "Expected process.exit not to be called!");
		} else if (maybeCli.error === EXIT_SYMBOL) {
			t.is(exitCode, expected.exitCode);
			t.is(callCount, 1, "Expected process.exit to be called exactly once!");
			return;
		}

		throw maybeCli.error;
	}

	const cli = maybeCli.data!;

	if (expected.flags) {
		if (Object.keys(expected.flags).length === 0) {
			t.is(Object.keys(cli.flags).length, 0);
		} else {
			t.like(cli.flags, expected.flags);
		}
	}

	if (expected.input) {
		if (expected.input.length === 0) {
			t.is(cli.input.length, 0);
		} else {
			t.like(cli.input, expected.input);
		}
	}
});
/* eslint-enable ava/no-conditional-assertion */
