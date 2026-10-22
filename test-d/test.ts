import * as tsd from "tsd";
import mrowki, { type AnyFlag, type AnyFlags, type Options, type Result } from "../src/index.ts";

// Full result with defaults
const result = mrowki("Usage…", {
	pkg: { name: "mrowki", version: "1.2.3" },
	flags: {
		foo: { type: "boolean", shortFlag: "f" },
		fooBar: { type: "string", aliases: ["fool"] },
		bar: { type: "string", default: "bing" },
		baz: { type: "boolean", default: true },
	},
});

tsd.expectType<string[]>(result.input);
tsd.expectType<boolean | undefined>(result.flags.foo);
tsd.expectType<string | undefined>(result.flags.fooBar);
tsd.expectType<"bing">(result.flags.bar);
tsd.expectType<true>(result.flags.baz);
tsd.expectType<(exitCode?: number) => never>(result.showHelp);
tsd.expectType<never>(result.showHelp(1));

const widenedDefault: string = "dist";
const resultWithWidenedDefault = mrowki("Usage…", {
	pkg: { name: "mrowki" },
	flags: {
		output: { type: "string", default: widenedDefault },
	},
});

tsd.expectType<string>(resultWithWidenedDefault.flags.output);

// Const options can be passed directly to mrowki
const options = {
	pkg: { name: "mrowki" },
	flags: {
		rainbow: { type: "boolean", shortFlag: "r" },
	},
} as const;

mrowki("Usage…", options);

// AnyFlag accepts supported flag types and matching defaults
tsd.expectAssignable<AnyFlag>({ type: "boolean", default: true });
tsd.expectAssignable<AnyFlag>({ type: "string", default: "cat" });

// AnyFlags supports empty and separately declared flag maps
const emptyFlags: AnyFlags = {};
tsd.expectType<AnyFlags>(emptyFlags);

const separateFlags = {
	unicorn: { type: "string", shortFlag: "u" },
	verbose: { type: "boolean" },
} satisfies AnyFlags;

const separateResult = mrowki("Usage…", { pkg: { name: "mrowki" }, flags: separateFlags });
tsd.expectAssignable<{ flags: { unicorn: string | undefined; verbose: boolean | undefined; }; }>(separateResult);

// Explicit Options and Result types preserve the declared flag types
type ExampleFlags = {
	enabled: { type: "boolean"; };
	output: { type: "string"; default: "dist"; };
};

const declaredOptions: Options<ExampleFlags> = {
	pkg: { name: "mrowki", bin: { mrowki: "bin/cli.js" } },
	flags: {
		enabled: { type: "boolean" },
		output: { type: "string", default: "dist" },
	},
};

const typedResult = mrowki("Usage…", declaredOptions);

tsd.expectAssignable<Result<ExampleFlags>>(typedResult);
tsd.expectType<boolean | undefined>(typedResult.flags.enabled);
tsd.expectType<"dist">(typedResult.flags.output);
