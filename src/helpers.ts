import type { PackageJsonLike } from "./types.ts";

export const getProcessTitle = ({ bin = {}, name }: PackageJsonLike): string => {
	const unscopedPackageName = name.replace(/^@[^\/]+\//v, "");

	// eslint-disable-next-line unicorn/prefer-ternary
	if (typeof bin === "string") {
		return unscopedPackageName;
	}

	return Object.keys(bin).at(0) ?? unscopedPackageName;
};

// Based on sindresorhus/redent

/** Strips leading newlines and trailing whitespace and reindents the string from the shortest common line indent. */
export const redent = (string: string, indent: number): string => {
	// Strip leading/trailing whitespace
	string = string.replace(/^\n+/v, "").replace(/(?<=\S)\s+$/v, "");

	// Match leading whitespace of each line
	const match = string.match(/^[\t ]*(?=\S)/gmv);
	if (!match) {
		return string;
	}

	// Re-indent from shortest common line indent
	const mindent = Math.min(...match.map(m => m.length));
	return string.replace(new RegExp(String.raw`^[\t ]{0,${mindent}}`, "gmv"), " ".repeat(indent));
};

// Based on joakimbeng/kebab-case

/** Converts a string from camelCase or PascalCase to kebab-case. */
export const kebabCase = (string: string): string => {
	// Preserve short flags
	if (string.length <= 1) {
		return string;
	}

	return string.replaceAll(
		/(?<=^|\S)\p{Uppercase_Letter}(?=$|\S)/gv,
		(match, offset) => `${offset === 0 ? "" : "-"}${match.toLowerCase()}`,
	);
};

/** Converts a string from kebab-case to camelCase. */
export const camelCase = (string: string): string => (
	string.replaceAll(/(?<=\S)-\p{Lowercase_Letter}(?=$|\S)/gv, m => m.slice(1).toUpperCase())
);
