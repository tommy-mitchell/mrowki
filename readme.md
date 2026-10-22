# mrowki

Minimal [meow](https://github.com/sindresorhus/meow)-like CLI helper using [`util.parseArgs`](https://nodejs.org/docs/latest/api/util.html#utilparseargsconfig).

> [!NOTE]
> `meow` is a great library that I have both used and contributed to. `mrowki` is an attempt to replicate it with fewer dependencies and less options. If `meow` meets your use case, use it!

<details>
<summary>Name inspiration</summary>
<br />

I had originally tried to use the name `mrow`, but npm disallowed it due to typosquatting rules.

My cat's name is Suki, and she often makes mrow noises. Hence, `mrowki` :)

</details>

## Features

- Parses `kebab-case` flags defined in `camelCase`
- Supports aliases, short flags, and default values
- Parses positional (non-flag) arguments
- Automatically supports `--help/-h` and `--version/-v`
- Sets the process title to the binary name defined in `package.json`
- A set of log-level helpers prepended with colored icons

### Limitations

- Only supports boolean and string flags
- No required or enum flags
- Boolean negation only via `--no-[flag]` (not `--[flag]=false`)
- Does not allow unknown flags
- No commands

## Install

```sh
npm install mrowki
```

<details>
<summary>Other package managers</summary>
<p>

```sh
yarn add mrowki
```

```sh
pnpm add mrowki
```

</p>
</details>

## Usage

```js
#!/usr/bin/env node
import mrowki, { log } from "mrowki";
import packageJson from "./package.json" with { type: "json" };

const cli = mrowki(`
  Usage
    $ lintr […files]

  Options
    --help          -h  Show help
    --version       -v  Show version
    --verbose       -V  Debug log level
    --log-level     -L  Set log level (debug, info, warn, error)
    --fix, --apply      Fix lints, if possible
`, {
  pkg: packageJson,
  flags: {
    verbose: {
      shortFlag: "V",
      type: "boolean",
    },
    logLevel: {
      type: "string",
      default: "info",
    },
    fix: {
      type: "boolean",
      aliases: ["apply"],
    },
  },
});

const logLevel = cli.flags.verbose ? "debug" : cli.flags.logLevel;

// lintr --fix foo.js -V -- bar.js
log.info(cli.flags, cli.input);
//=> ℹ { fix: true, verbose: true, logLevel: "info" }, ["foo.js", "bar.js"]
```

## API

### mrowki(helpText, options)

Returns an `object` with the parsed `process.argv`:

- `flags` (`Record<string, boolean | string>`) - Flag results in camelCase, accounting for defaults and aliases.
- `input` (`string[]`) - Positional (non-flag) arguments.
- `showHelp(exitCode?)` (`function`) - Shows the help text and exits with given code (default: `2` for incorrect usage).

#### helpText

Type: `string`

Help text shown with `--help`, `-h`, or `cli.showHelp([exitCode])`.

Text is trimmed and re-indented, so you can pass a template literal without e.g. a [`dedent`](https://github.com/dmnd/dedent) helper:

<details>
<summary>Example</summary>
<p>

```js
mrowki(`

      Usage
        $ foo

`, {…});
```

```sh
$ foo --help

  Usage:
    $ foo

$ …
```

</p>
</details>

#### options

Type: `object`

##### pkg

Required\
Type: `object`

The parsed `package.json` used for the version flag and process title.

##### flags

Type: `object`

Argument flags, authored in camelCase (`someFlag`) but matching in kebab-case (`--some-flag`).

###### type

Required\
Type: `"boolean" | "string"`

Type of the flag.

###### default

Type: `boolean | string`

Default value when the flag is not specified.

###### shortFlag

Type: `string`

A short flag alias.

###### aliases

Type: `string[]`

Other names for the flag.

### log

Type: `object`

A set of log-level helpers prepended with colored icons, with fallbacks for non-Unicode terminals.

| Level   | Icon | Fallback |
| ------- | :--: | :------: |
| info    | `ℹ`  |   `i`    |
| success | `✔`  |   `√`    |
| warn    | `⚠`  |   `‼`    |
| error   | `✖`  |   `×`    |

Based on [log-symbols](https://github.com/sindresorhus/log-symbols).

#### info

Type: `(...args: unknown[]): void`

Logs to stdout with a prepended blue info icon (ℹ).

#### success

Type: `(...args: unknown[]): void`

Logs to stdout with a prepended green success icon (✔)

#### warn

Type: `(...args: unknown[]): void`

Logs to stderr with a prepended yellow warning icon (⚠).

#### error

Type: `(...args: unknown[]): void`

Logs to stderr with a prepended red error icon (✖).

## Related

- [meow](https://github.com/sindresorhus/meow) - CLI app helper.
- [peowly](https://github.com/voxpelli/peowly) - meow inspired parseArgs() based CLI parser with help text helpers.
- [pargs](https://github.com/ljharb/pargs) - A useful wrapper for `util.parseArgs`.
