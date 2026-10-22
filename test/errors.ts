import test from "ava";
import { dedent } from "@tommy-mitchell/test-helpers";
import { verify } from "./_utils.ts";

test("errors on unknown flag", verify, {
	args: "--unknown",
	expected: {
		exitCode: 1,
		message:
			`<red>✖</fg> Unknown option '--unknown'. To specify a positional argument starting with a '-', place it at the end of the command after '--', as in '-- "--unknown"`,
	},
});

test("errors on missing string flag argument", verify, {
	flags: {
		flag: {
			type: "string",
		},
	},
	args: "--flag",
	expected: {
		exitCode: 1,
		message: "<red>✖</fg> Option '--flag <value>' argument missing",
	},
});

test("errors on ambiguous string flag argument", verify, {
	flags: {
		foo: {
			type: "string",
		},
		bar: {
			type: "boolean",
		},
	},
	args: "--foo --bar",
	expected: {
		exitCode: 1,
		message: dedent`
			<red>✖</fg> Option '--foo' argument is ambiguous.
			Did you forget to specify the option argument for '--foo'?
			To specify an option argument starting with a dash use '--foo=-XYZ'.
		`,
	},
});

test("errors on ambiguous short string flag argument", verify, {
	flags: {
		foo: {
			type: "string",
			shortFlag: "f",
		},
		bar: {
			type: "boolean",
		},
	},
	args: "-f --bar",
	expected: {
		exitCode: 1,
		message: dedent`
			<red>✖</fg> Option '-f' argument is ambiguous.
			Did you forget to specify the option argument for '-f'?
			To specify an option argument starting with a dash use '--foo=-XYZ' or '-f-XYZ'.
		`,
	},
});

test("errors on boolean flag argument", verify, {
	flags: {
		flag: {
			type: "boolean",
		},
	},
	args: "--flag=false",
	expected: {
		exitCode: 1,
		message: "<red>✖</fg> Option '--flag' does not take an argument. Use '--no-flag' for negation.",
	},
});

// @ts-expect-error -- incorrect default type
test("errors on incorrect default type", verify, {
	flags: {
		flag: {
			default: "not-boolean",
			type: "boolean",
		},
	},
	args: "",
	expected: {
		exitCode: 1,
		message: "<red>✖</fg> The \"flag.default\" property must be of type boolean. Received type string ('not-boolean')",
	},
});

test("does not error on empty shortFlag", verify, {
	flags: {
		flag: {
			shortFlag: "",
			type: "boolean",
		},
	},
	args: "--flag",
	expected: {
		flags: {
			flag: true,
		},
	},
});

test.todo("throws if parseArgs() error is unrelated");
