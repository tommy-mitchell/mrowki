import test from "ava";
import * as tq from "test-quadruple";
import { EXIT_SYMBOL, replace, verify } from "./_utils.ts";

test("main", verify, {
	flags: {
		foo: {
			type: "boolean",
		},
		bar: {
			type: "boolean",
			shortFlag: "b",
		},
		bing: {
			type: "string",
			aliases: ["bong"],
		},
	},
	pkg: { name: "foo-cli" },
	args: "--foo -b one --bong baz two -- -three",
	expected: {
		flags: {
			foo: true,
			bar: true,
			bing: "baz",
		},
		input: ["one", "two", "-three"],
		title: "foo-cli",
	},
});

for (const flag of ["--help", "-h"]) {
	test(`shows help (${flag})`, verify, {
		help: "Usage: …",
		pkg: { name: "foo-cli" },
		args: flag,
		expected: {
			exitCode: 0,
			message: "\n  Usage: …",
		},
	});
}

for (const flag of ["--version", "-v"]) {
	test(`shows version (${flag})`, verify, {
		pkg: { name: "foo-cli", version: "1.2.3" },
		args: flag,
		expected: {
			exitCode: 0,
			message: "1.2.3",
		},
	});
}

test("parses input", verify, {
	args: "foo bar -- -o",
	expected: {
		flags: {},
		input: ["foo", "bar", "-o"],
	},
});

test("no input", verify, {
	args: "",
	expected: {
		flags: {},
		input: [],
	},
});

test("parses boolean flags", verify, {
	flags: {
		foo: {
			type: "boolean",
		},
		bar: {
			type: "boolean",
			aliases: ["bra"],
		},
		baz: {
			type: "boolean",
			shortFlag: "b",
		},
		co: {
			type: "boolean",
			shortFlag: "c",
		},
	},
	args: "--foo --no-bra -bc",
	expected: {
		flags: {
			foo: true,
			bar: false,
			baz: true,
			co: true,
		},
		input: [],
	},
});

test("parses string flags", verify, {
	flags: {
		foo: {
			type: "string",
		},
		bar: {
			type: "string",
		},
	},
	args: "--foo=one --bar two",
	expected: {
		flags: {
			foo: "one",
			bar: "two",
		},
		input: [],
	},
});

test("last of aliases/short/flag is preserved", verify, {
	flags: {
		foo: {
			type: "boolean",
			shortFlag: "f",
			aliases: ["bar", "baz"],
		},
	},
	args: "--no-baz -f --no-bar --foo",
	expected: {
		flags: {
			foo: true,
		},
		input: [],
	},
});

test("default flag values", verify, {
	flags: {
		foo: {
			type: "boolean",
			default: true,
		},
		bar: {
			type: "string",
			default: "baz",
		},
	},
	args: "",
	expected: {
		flags: {
			foo: true,
			bar: "baz",
		},
		input: [],
	},
});

test("converts between camelCase and kebab-case", verify, {
	flags: {
		fooBar: {
			type: "boolean",
			aliases: ["bingBong"],
		},
	},
	args: "--foo-bar --no-bing-bong",
	expected: {
		flags: { fooBar: true },
		input: [],
	},
});

test("showHelp", async (t) => {
	const { mrowki, spies: { exit }, logs } = await replace("");
	const cli = mrowki("Usage…", { pkg: { name: "foo-cli" } });

	try {
		cli.showHelp();
	} catch (error) {
		t.is(error, EXIT_SYMBOL); // eslint-disable-line ava/no-conditional-assertion
	} finally {
		const [exitCode] = tq.explain(exit).flatCalls;
		t.is(exitCode, 2);

		t.is(logs(), "\n  Usage…");
	}
});
