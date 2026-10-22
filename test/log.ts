import test, { type ExecutionContext } from "ava";
import * as tq from "test-quadruple";
import { replace } from "./_utils.ts";

type WithLoggerMacroArgs = [
	assertions: (
		t: ExecutionContext,
		context: { log: typeof import("#src/log.ts"); logs: () => string; },
	) => void,
];

const _withLogger = (hasFallback: boolean) => (
	test.macro<WithLoggerMacroArgs>(async (t, assertions) => {
		const { log, logs } = await replace("", !hasFallback);
		assertions(t, { log, logs });
	})
);

const withLogger = _withLogger(false);
const withLoggerFallback = _withLogger(true);

test("info", withLogger, (t, { log, logs }) => {
	log.info("one", "two");
	t.is(logs(), "<blue>ℹ</fg> one two");
});

test("info (fallback)", withLoggerFallback, (t, { log, logs }) => {
	log.info("one", "two");
	t.is(logs(), "<blue>i</fg> one two");
});

test("success", withLogger, (t, { log, logs }) => {
	log.success("one", "two");
	t.is(logs(), "<green>✔</fg> one two");
});

test("success (fallback)", withLoggerFallback, (t, { log, logs }) => {
	log.success("one", "two");
	t.is(logs(), "<green>√</fg> one two");
});

test("warn", withLogger, (t, { log, logs }) => {
	log.warn("one", "two");
	t.is(logs(), "<yellow>⚠</fg> one two");
});

test("warn (fallback)", withLoggerFallback, (t, { log, logs }) => {
	log.warn("one", "two");
	t.is(logs(), "<yellow>‼</fg> one two");
});

test("error", withLogger, (t, { log, logs }) => {
	log.error("one", "two");
	t.is(logs(), "<red>✖</fg> one two");
});

test("error (fallback)", withLoggerFallback, (t, { log, logs }) => {
	log.error("one", "two");
	t.is(logs(), "<red>×</fg> one two");
});

test("isUnicodeSupported() is only called once", async (t) => {
	const logger = tq.spy();
	const isUnicodeSupported = tq.spy(tq.returns(true));

	const log = await tq.replace<typeof import("#src/log.ts")>({
		globalMocks: { import: { console: { error: logger, log: logger } } },
		importMeta: import.meta,
		localMocks: {
			"is-unicode-supported": isUnicodeSupported,
		},
		modulePath: "#src/log.ts",
	});

	t.is(tq.explain(isUnicodeSupported).callCount, 0, "isUnicodeSupported should be lazily evaluated");

	log.info("one");
	log.success("two");
	log.warn("three");
	log.error("four");

	t.is(tq.explain(isUnicodeSupported).callCount, 1);
});
