import * as tsd from "tsd";
import mrowki, { type AnyFlag } from "../src/index.ts";

// Flag aliases and short names are not exposed in result flags
const result = mrowki("Usage…", {
	pkg: { name: "mrowki" },
	flags: {
		foo: { type: "boolean", shortFlag: "f" },
		fooBar: { type: "string", aliases: ["fool"] },
	},
});

tsd.expectError(result.flags.foobar);
tsd.expectError(result.flags["foo-bar"]);
tsd.expectError(result.flags.fool);
tsd.expectError(result.flags.f);

// Required arguments and package metadata are enforced
tsd.expectError(mrowki("Usage…"));
tsd.expectError(mrowki("Usage…", {}));
tsd.expectError(mrowki("Usage…", { pkg: {} }));
tsd.expectError(mrowki("Usage…", { pkg: { name: "mrowki", version: 1 } }));
tsd.expectError(mrowki("Usage…", { pkg: { name: "mrowki", bin: 1 } }));

// Flag types and option properties reject invalid values
tsd.expectError<AnyFlag>({ type: "boolean", default: "cat" });
tsd.expectError<AnyFlag>({ type: "string", default: false });
tsd.expectError<AnyFlag>({ type: "number" });
tsd.expectError<AnyFlag>({ type: "boolean", aliases: "b" });
tsd.expectError<AnyFlag>({ type: "string", shortFlag: 1 });

// mrowki rejects defaults that do not match each flag's type
tsd.expectError(
	mrowki("Usage…", {
		pkg: { name: "" },
		flags: {
			flag: {
				default: "not-boolean",
				type: "boolean",
			},
		},
	}),
);

tsd.expectError(
	mrowki("Usage…", {
		pkg: { name: "" },
		flags: {
			flag: {
				type: "string",
				default: false,
			},
		},
	}),
);
