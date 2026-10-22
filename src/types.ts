type FlagType = "boolean" | "string";

// dprint-ignore
type PrimitiveType<Type extends FlagType> =
	Type extends "boolean" ? boolean :
	Type extends "string" ? string :
	unknown;

type Flag<Type extends FlagType> = Readonly<{
	/**
	 * Other names for the flag.
	 *
	 * @example
	 * ```json
	 * package: {
	 *   aliases: ["pkg", "p"]
	 * }
	 * ```
	 */
	aliases?: string[];

	/**
	 * Default value when the flag is not specified.
	 *
	 * @example
	 * ```json
	 * foo: {
	 *   type: "boolean",
	 *   default: true
	 * }
	 * ```
	 */
	default?: PrimitiveType<Type>;

	/**
	 * A short flag alias.
	 *
	 * @example
	 * ```json
	 * output: {
	 *   shortFlag: "o"
	 * }
	 * ```
	 */
	shortFlag?: string;

	/** Type of the flag. (`boolean` or `string`) */
	type: Type;
}>;

export type AnyFlag = Flag<"boolean"> | Flag<"string">;
export type AnyFlags = Record<string, AnyFlag>;

/** Constrains `Flags` so each flag's `default` must match its `type`. */
export type ValidatedFlags<Flags extends AnyFlags> = AnyFlags & { [K in keyof Flags]: Flag<Flags[K]["type"]>; };

export type PackageJsonLike = {
	bin?: Record<string, string> | string;
	name: string;
	version?: string;
};

export type Options<Flags extends ValidatedFlags<Flags>> = Readonly<{
	/** Argument flags, authored in camelCase (`someFlag`) but matching in kebab-case (`--some-flag`). */
	flags?: Flags;

	/** The parsed `package.json` used for the version flag and process title. */
	pkg: PackageJsonLike;
}>;

type MaybeOptional<T, U> = T extends { default: infer Default; } ? Default : U | undefined;

export type ResultFlags<Flags extends AnyFlags> = {
	[F in keyof Flags]: MaybeOptional<Flags[F], PrimitiveType<Flags[F]["type"]>>;
};

/** @internal */
export type ResultFlagsWithHelpAndVersion<Flags extends AnyFlags> = ResultFlags<
	Flags & { help: { type: "boolean"; }; version: { type: "boolean"; }; }
>;

export type Result<Flags extends ValidatedFlags<Flags>> = {
	/** Flag results in camelCase, accounting for defaults and aliases. */
	flags: ResultFlags<Flags>;

	/** Positional (non-flag) arguments. */
	input: string[];

	/** Shows the help text and exits with given code (default: `2` for incorrect usage). */
	showHelp: (exitCode?: number) => never;
};
