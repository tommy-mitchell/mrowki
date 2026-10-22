import { styleText } from "node:util";
import isUnicodeSupported from "is-unicode-supported";

let value: boolean | undefined;

const is = {
	get unicodeSupported(): boolean {
		value ??= isUnicodeSupported();
		return value;
	},
};

/** Logs to stdout with a prepended blue info icon (ℹ). */
export const info = (...args: unknown[]): void => (
	console.log(styleText("blue", is.unicodeSupported ? "ℹ" : "i"), ...args)
);

/** Logs to stdout with a prepended green success icon (✔). */
export const success = (...args: unknown[]): void => (
	console.log(styleText("green", is.unicodeSupported ? "✔" : "√"), ...args)
);

/** Logs to stderr with a prepended yellow warning icon (⚠). */
export const warn = (...args: unknown[]): void => (
	console.error(styleText("yellow", is.unicodeSupported ? "⚠" : "‼"), ...args)
);

/** Logs to stderr with a prepended red error icon (✖). */
export const error = (...args: unknown[]): void => (
	console.error(styleText("red", is.unicodeSupported ? "✖" : "×"), ...args)
);
