import * as configs from "@tommy-mitchell/configs/xo";

/** @type {import("xo").FlatXoConfig} */
export default [...configs.xo, ...configs.dprint, { ignores: ["test-d", "test/fixtures"] }, {
	rules: {
		"unicorn/no-process-exit": "off",
	},
}, {
	files: "test/*.ts",
	rules: {
		"perfectionist/sort-objects": "off",
	},
}];
