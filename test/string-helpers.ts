import test from "ava";
import { camelCase, kebabCase, redent } from "#src/helpers.ts";

test("redent", t => {
	// dprint-ignore
	t.is(redent(`
		foo
		bar
	`, 2), "  foo\n  bar");

	// dprint-ignore
	t.is(redent(`
		  foo
		bar
	`, 0), "  foo\nbar");

	t.is(redent("\n\n  \n  foo\n  bar      \n   \n  \n", 1), " \n foo\n bar");
	t.is(redent("foo\n  bar", 2), "  foo\n    bar");
	t.is(redent("\tfoo\n\tbar", 1), " foo\n bar");
	t.is(redent("", 2), "");
	t.is(redent("  foo   ", 0), "foo");
});

test("kebabCase", t => {
	// Converts camelCase and PascalCase to kebab-case
	t.is(kebabCase("fooBarBaz"), "foo-bar-baz");
	t.is(kebabCase("FooBarBaz"), "foo-bar-baz");
	t.is(kebabCase("aB"), "a-b");
	t.is(kebabCase("foo2Bar"), "foo2-bar");
	t.is(kebabCase("ølÜberÅh"), "øl-über-åh");
	t.is(kebabCase("Érnest"), "érnest");

	// Preserves short flags
	t.is(kebabCase("f"), "f");
	t.is(kebabCase("F"), "F");

	// Ignores non-camel-cased strings and spaces
	t.is(kebabCase("foo-bar-baz"), "foo-bar-baz");
	t.is(kebabCase("foo_bar_baz"), "foo_bar_baz");
	t.is(kebabCase("hello world"), "hello world");
	t.is(kebabCase("hello World!"), "hello World!");
	t.is(kebabCase("-- hello world --"), "-- hello world --");
});

test("camelCase", t => {
	// Converts kebab-case to camelCase
	t.is(camelCase("foo-bar-baz"), "fooBarBaz");
	t.is(camelCase("a-b"), "aB");
	t.is(camelCase("foo-bar2-baz"), "fooBar2Baz");
	t.is(camelCase("øl-über-åh"), "ølÜberÅh");

	// Ignores non-kebab-cased strings
	t.is(camelCase("Foo-Bar-Baz"), "Foo-Bar-Baz");
	t.is(camelCase("foo_bar_baz"), "foo_bar_baz");
	t.is(camelCase("FooBarBaz"), "FooBarBaz");
	t.is(camelCase("hello -world"), "hello -world");

	// Edge cases
	t.is(camelCase("-foo-bar-baz"), "-fooBarBaz");
	t.is(camelCase("foo--bar"), "foo-Bar");
	t.is(camelCase("foo-2-bar"), "foo-2Bar");
});
