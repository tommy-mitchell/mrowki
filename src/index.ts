import * as logHelpers from "./log.ts";

/** A set of log-level helpers prepended with colored icons, with fallbacks for non-Unicode terminals. */
export const log = logHelpers;

export { mrowki as default } from "./main.ts";
export type { AnyFlag, AnyFlags, Options, Result } from "./types.ts";
