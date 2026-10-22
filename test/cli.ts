import { stripVTControlCharacters as stripAnsi } from "node:util";
import test from "ava";
import { $, dedent, type ExecaError, parseCommandString } from "@tommy-mitchell/test-helpers";
import { atFixture } from "./_utils.ts";

const $$ = $({ all: true, reject: false });

test("binary", async (t) => {
	const fixture = atFixture("cli/cli.ts");
	const resultOrError = await $$(fixture, parseCommandString("--fix foo.js -V -- bar.js"));

	if (resultOrError.failed && resultOrError.exitCode === undefined) {
		// eslint-disable-next-line @typescript-eslint/only-throw-error -- types are wrong, class is an actual Error instance
		throw resultOrError as ExecaError;
	}

	const { all: output, exitCode } = resultOrError;

	t.is(
		stripAnsi(output),
		dedent`
			flags: { fix: true, verbose: true, logLevel: 'info' }
			input: [ 'foo.js', 'bar.js' ]
		`,
	);

	t.is(exitCode, 0);
});
