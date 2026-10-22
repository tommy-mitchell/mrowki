import test from "ava";
import { verify } from "./_utils.ts";

test("parses title from package name", verify, {
	pkg: { name: "test-cli" },
	args: "",
	expected: {
		title: "test-cli",
	},
});

test("removes package scope from title", verify, {
	pkg: { name: "@scope/test-cli" },
	args: "",
	expected: {
		title: "test-cli",
	},
});

test("falls back to package name if string bin", verify, {
	pkg: { name: "test-cli", bin: "./bin.js" },
	args: "",
	expected: {
		title: "test-cli",
	},
});

test("uses first key of object bin", verify, {
	pkg: {
		name: "test-cli",
		bin: {
			test: "./bin.js",
			foo: "./bin2.js",
		},
	},
	args: "",
	expected: {
		title: "test",
	},
});
