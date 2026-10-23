import { stripVTControlCharacters as stripAnsi } from "node:util";
import test from "ava";
import { $$, dedent, parseCommandString } from "@tommy-mitchell/test-helpers";
import { atFixture } from "./_utils.ts";

test("binary", async (t) => {
	const fixture = atFixture("cli/cli.ts");
	const { stdout: output, exitCode } = await $$(fixture, parseCommandString("--fix foo.js -V -- bar.js"));

	t.is(
		stripAnsi(output),
		dedent`
			flags: { fix: true, verbose: true, logLevel: 'info' }
			input: [ 'foo.js', 'bar.js' ]
		`,
	);

	t.is(exitCode, 0);
});
