#!/usr/bin/env node

/* eslint-disable max-len, flowtype/require-valid-file-annotation, flowtype/require-return-type */
/* global packageInformationStores, null, $$SETUP_STATIC_TABLES */

// Used for the resolveUnqualified part of the resolution (ie resolving folder/index.js & file extensions)
// Deconstructed so that they aren't affected by any fs monkeypatching occuring later during the execution
const {statSync, lstatSync, readlinkSync, readFileSync, existsSync, realpathSync} = require('fs');

const Module = require('module');
const path = require('path');
const StringDecoder = require('string_decoder');

const ignorePattern = null ? new RegExp(null) : null;

const pnpFile = path.resolve(__dirname, __filename);
const builtinModules = new Set(Module.builtinModules || Object.keys(process.binding('natives')));

const topLevelLocator = {name: null, reference: null};
const blacklistedLocator = {name: NaN, reference: NaN};

// Used for compatibility purposes - cf setupCompatibilityLayer
const patchedModules = [];
const fallbackLocators = [topLevelLocator];

// Matches backslashes of Windows paths
const backwardSlashRegExp = /\\/g;

// Matches if the path must point to a directory (ie ends with /)
const isDirRegExp = /\/$/;

// Matches if the path starts with a valid path qualifier (./, ../, /)
// eslint-disable-next-line no-unused-vars
const isStrictRegExp = /^\.{0,2}\//;

// Splits a require request into its components, or return null if the request is a file path
const pathRegExp = /^(?![a-zA-Z]:[\\\/]|\\\\|\.{0,2}(?:\/|$))((?:@[^\/]+\/)?[^\/]+)\/?(.*|)$/;

// Keep a reference around ("module" is a common name in this context, so better rename it to something more significant)
const pnpModule = module;

/**
 * Used to disable the resolution hooks (for when we want to fallback to the previous resolution - we then need
 * a way to "reset" the environment temporarily)
 */

let enableNativeHooks = true;

/**
 * Simple helper function that assign an error code to an error, so that it can more easily be caught and used
 * by third-parties.
 */

function makeError(code, message, data = {}) {
  const error = new Error(message);
  return Object.assign(error, {code, data});
}

/**
 * Ensures that the returned locator isn't a blacklisted one.
 *
 * Blacklisted packages are packages that cannot be used because their dependencies cannot be deduced. This only
 * happens with peer dependencies, which effectively have different sets of dependencies depending on their parents.
 *
 * In order to deambiguate those different sets of dependencies, the Yarn implementation of PnP will generate a
 * symlink for each combination of <package name>/<package version>/<dependent package> it will find, and will
 * blacklist the target of those symlinks. By doing this, we ensure that files loaded through a specific path
 * will always have the same set of dependencies, provided the symlinks are correctly preserved.
 *
 * Unfortunately, some tools do not preserve them, and when it happens PnP isn't able anymore to deduce the set of
 * dependencies based on the path of the file that makes the require calls. But since we've blacklisted those paths,
 * we're able to print a more helpful error message that points out that a third-party package is doing something
 * incompatible!
 */

// eslint-disable-next-line no-unused-vars
function blacklistCheck(locator) {
  if (locator === blacklistedLocator) {
    throw makeError(
      `BLACKLISTED`,
      [
        `A package has been resolved through a blacklisted path - this is usually caused by one of your tools calling`,
        `"realpath" on the return value of "require.resolve". Since the returned values use symlinks to disambiguate`,
        `peer dependencies, they must be passed untransformed to "require".`,
      ].join(` `)
    );
  }

  return locator;
}

let packageInformationStores = new Map([
  ["webpack", new Map([
    ["5.27.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-webpack-5.27.0-387458f83142253f2759e22415dc1359746e6940-integrity/node_modules/webpack/"),
      packageDependencies: new Map([
        ["@types/eslint-scope", "3.7.0"],
        ["@types/estree", "0.0.46"],
        ["@webassemblyjs/ast", "1.11.0"],
        ["@webassemblyjs/wasm-edit", "1.11.0"],
        ["@webassemblyjs/wasm-parser", "1.11.0"],
        ["acorn", "8.1.0"],
        ["browserslist", "4.16.3"],
        ["chrome-trace-event", "1.0.2"],
        ["enhanced-resolve", "5.7.0"],
        ["es-module-lexer", "0.4.1"],
        ["eslint-scope", "5.1.1"],
        ["events", "3.3.0"],
        ["glob-to-regexp", "0.4.1"],
        ["graceful-fs", "4.2.6"],
        ["json-parse-better-errors", "1.0.2"],
        ["loader-runner", "4.2.0"],
        ["mime-types", "2.1.29"],
        ["neo-async", "2.6.2"],
        ["schema-utils", "3.0.0"],
        ["tapable", "2.2.0"],
        ["terser-webpack-plugin", "5.1.1"],
        ["watchpack", "2.1.1"],
        ["webpack-sources", "2.2.0"],
        ["webpack", "5.27.0"],
      ]),
    }],
  ])],
  ["@types/eslint-scope", new Map([
    ["3.7.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@types-eslint-scope-3.7.0-4792816e31119ebd506902a482caec4951fabd86-integrity/node_modules/@types/eslint-scope/"),
      packageDependencies: new Map([
        ["@types/eslint", "7.2.7"],
        ["@types/estree", "0.0.46"],
        ["@types/eslint-scope", "3.7.0"],
      ]),
    }],
  ])],
  ["@types/eslint", new Map([
    ["7.2.7", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@types-eslint-7.2.7-f7ef1cf0dceab0ae6f9a976a0a9af14ab1baca26-integrity/node_modules/@types/eslint/"),
      packageDependencies: new Map([
        ["@types/estree", "0.0.46"],
        ["@types/json-schema", "7.0.7"],
        ["@types/eslint", "7.2.7"],
      ]),
    }],
  ])],
  ["@types/estree", new Map([
    ["0.0.46", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@types-estree-0.0.46-0fb6bfbbeabd7a30880504993369c4bf1deab1fe-integrity/node_modules/@types/estree/"),
      packageDependencies: new Map([
        ["@types/estree", "0.0.46"],
      ]),
    }],
  ])],
  ["@types/json-schema", new Map([
    ["7.0.7", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@types-json-schema-7.0.7-98a993516c859eb0d5c4c8f098317a9ea68db9ad-integrity/node_modules/@types/json-schema/"),
      packageDependencies: new Map([
        ["@types/json-schema", "7.0.7"],
      ]),
    }],
  ])],
  ["@webassemblyjs/ast", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-ast-1.11.0-a5aa679efdc9e51707a4207139da57920555961f-integrity/node_modules/@webassemblyjs/ast/"),
      packageDependencies: new Map([
        ["@webassemblyjs/helper-numbers", "1.11.0"],
        ["@webassemblyjs/helper-wasm-bytecode", "1.11.0"],
        ["@webassemblyjs/ast", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/helper-numbers", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-numbers-1.11.0-7ab04172d54e312cc6ea4286d7d9fa27c88cd4f9-integrity/node_modules/@webassemblyjs/helper-numbers/"),
      packageDependencies: new Map([
        ["@webassemblyjs/floating-point-hex-parser", "1.11.0"],
        ["@webassemblyjs/helper-api-error", "1.11.0"],
        ["@xtuc/long", "4.2.2"],
        ["@webassemblyjs/helper-numbers", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/floating-point-hex-parser", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-floating-point-hex-parser-1.11.0-34d62052f453cd43101d72eab4966a022587947c-integrity/node_modules/@webassemblyjs/floating-point-hex-parser/"),
      packageDependencies: new Map([
        ["@webassemblyjs/floating-point-hex-parser", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/helper-api-error", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-api-error-1.11.0-aaea8fb3b923f4aaa9b512ff541b013ffb68d2d4-integrity/node_modules/@webassemblyjs/helper-api-error/"),
      packageDependencies: new Map([
        ["@webassemblyjs/helper-api-error", "1.11.0"],
      ]),
    }],
  ])],
  ["@xtuc/long", new Map([
    ["4.2.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@xtuc-long-4.2.2-d291c6a4e97989b5c61d9acf396ae4fe133a718d-integrity/node_modules/@xtuc/long/"),
      packageDependencies: new Map([
        ["@xtuc/long", "4.2.2"],
      ]),
    }],
  ])],
  ["@webassemblyjs/helper-wasm-bytecode", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-wasm-bytecode-1.11.0-85fdcda4129902fe86f81abf7e7236953ec5a4e1-integrity/node_modules/@webassemblyjs/helper-wasm-bytecode/"),
      packageDependencies: new Map([
        ["@webassemblyjs/helper-wasm-bytecode", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/wasm-edit", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-edit-1.11.0-ee4a5c9f677046a210542ae63897094c2027cb78-integrity/node_modules/@webassemblyjs/wasm-edit/"),
      packageDependencies: new Map([
        ["@webassemblyjs/ast", "1.11.0"],
        ["@webassemblyjs/helper-buffer", "1.11.0"],
        ["@webassemblyjs/helper-wasm-bytecode", "1.11.0"],
        ["@webassemblyjs/helper-wasm-section", "1.11.0"],
        ["@webassemblyjs/wasm-gen", "1.11.0"],
        ["@webassemblyjs/wasm-opt", "1.11.0"],
        ["@webassemblyjs/wasm-parser", "1.11.0"],
        ["@webassemblyjs/wast-printer", "1.11.0"],
        ["@webassemblyjs/wasm-edit", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/helper-buffer", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-buffer-1.11.0-d026c25d175e388a7dbda9694e91e743cbe9b642-integrity/node_modules/@webassemblyjs/helper-buffer/"),
      packageDependencies: new Map([
        ["@webassemblyjs/helper-buffer", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/helper-wasm-section", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-wasm-section-1.11.0-9ce2cc89300262509c801b4af113d1ca25c1a75b-integrity/node_modules/@webassemblyjs/helper-wasm-section/"),
      packageDependencies: new Map([
        ["@webassemblyjs/ast", "1.11.0"],
        ["@webassemblyjs/helper-buffer", "1.11.0"],
        ["@webassemblyjs/helper-wasm-bytecode", "1.11.0"],
        ["@webassemblyjs/wasm-gen", "1.11.0"],
        ["@webassemblyjs/helper-wasm-section", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/wasm-gen", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-gen-1.11.0-3cdb35e70082d42a35166988dda64f24ceb97abe-integrity/node_modules/@webassemblyjs/wasm-gen/"),
      packageDependencies: new Map([
        ["@webassemblyjs/ast", "1.11.0"],
        ["@webassemblyjs/helper-wasm-bytecode", "1.11.0"],
        ["@webassemblyjs/ieee754", "1.11.0"],
        ["@webassemblyjs/leb128", "1.11.0"],
        ["@webassemblyjs/utf8", "1.11.0"],
        ["@webassemblyjs/wasm-gen", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/ieee754", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-ieee754-1.11.0-46975d583f9828f5d094ac210e219441c4e6f5cf-integrity/node_modules/@webassemblyjs/ieee754/"),
      packageDependencies: new Map([
        ["@xtuc/ieee754", "1.2.0"],
        ["@webassemblyjs/ieee754", "1.11.0"],
      ]),
    }],
  ])],
  ["@xtuc/ieee754", new Map([
    ["1.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@xtuc-ieee754-1.2.0-eef014a3145ae477a1cbc00cd1e552336dceb790-integrity/node_modules/@xtuc/ieee754/"),
      packageDependencies: new Map([
        ["@xtuc/ieee754", "1.2.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/leb128", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-leb128-1.11.0-f7353de1df38aa201cba9fb88b43f41f75ff403b-integrity/node_modules/@webassemblyjs/leb128/"),
      packageDependencies: new Map([
        ["@xtuc/long", "4.2.2"],
        ["@webassemblyjs/leb128", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/utf8", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-utf8-1.11.0-86e48f959cf49e0e5091f069a709b862f5a2cadf-integrity/node_modules/@webassemblyjs/utf8/"),
      packageDependencies: new Map([
        ["@webassemblyjs/utf8", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/wasm-opt", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-opt-1.11.0-1638ae188137f4bb031f568a413cd24d32f92978-integrity/node_modules/@webassemblyjs/wasm-opt/"),
      packageDependencies: new Map([
        ["@webassemblyjs/ast", "1.11.0"],
        ["@webassemblyjs/helper-buffer", "1.11.0"],
        ["@webassemblyjs/wasm-gen", "1.11.0"],
        ["@webassemblyjs/wasm-parser", "1.11.0"],
        ["@webassemblyjs/wasm-opt", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/wasm-parser", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-parser-1.11.0-3e680b8830d5b13d1ec86cc42f38f3d4a7700754-integrity/node_modules/@webassemblyjs/wasm-parser/"),
      packageDependencies: new Map([
        ["@webassemblyjs/ast", "1.11.0"],
        ["@webassemblyjs/helper-api-error", "1.11.0"],
        ["@webassemblyjs/helper-wasm-bytecode", "1.11.0"],
        ["@webassemblyjs/ieee754", "1.11.0"],
        ["@webassemblyjs/leb128", "1.11.0"],
        ["@webassemblyjs/utf8", "1.11.0"],
        ["@webassemblyjs/wasm-parser", "1.11.0"],
      ]),
    }],
  ])],
  ["@webassemblyjs/wast-printer", new Map([
    ["1.11.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wast-printer-1.11.0-680d1f6a5365d6d401974a8e949e05474e1fab7e-integrity/node_modules/@webassemblyjs/wast-printer/"),
      packageDependencies: new Map([
        ["@webassemblyjs/ast", "1.11.0"],
        ["@xtuc/long", "4.2.2"],
        ["@webassemblyjs/wast-printer", "1.11.0"],
      ]),
    }],
  ])],
  ["acorn", new Map([
    ["8.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-acorn-8.1.0-52311fd7037ae119cbb134309e901aa46295b3fe-integrity/node_modules/acorn/"),
      packageDependencies: new Map([
        ["acorn", "8.1.0"],
      ]),
    }],
  ])],
  ["browserslist", new Map([
    ["4.16.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-browserslist-4.16.3-340aa46940d7db878748567c5dea24a48ddf3717-integrity/node_modules/browserslist/"),
      packageDependencies: new Map([
        ["caniuse-lite", "1.0.30001203"],
        ["colorette", "1.2.2"],
        ["electron-to-chromium", "1.3.693"],
        ["escalade", "3.1.1"],
        ["node-releases", "1.1.71"],
        ["browserslist", "4.16.3"],
      ]),
    }],
  ])],
  ["caniuse-lite", new Map([
    ["1.0.30001203", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-caniuse-lite-1.0.30001203-a7a34df21a387d9deffcd56c000b8cf5ab540580-integrity/node_modules/caniuse-lite/"),
      packageDependencies: new Map([
        ["caniuse-lite", "1.0.30001203"],
      ]),
    }],
  ])],
  ["colorette", new Map([
    ["1.2.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-colorette-1.2.2-cbcc79d5e99caea2dbf10eb3a26fd8b3e6acfa94-integrity/node_modules/colorette/"),
      packageDependencies: new Map([
        ["colorette", "1.2.2"],
      ]),
    }],
  ])],
  ["electron-to-chromium", new Map([
    ["1.3.693", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-electron-to-chromium-1.3.693-5089c506a925c31f93fcb173a003a22e341115dd-integrity/node_modules/electron-to-chromium/"),
      packageDependencies: new Map([
        ["electron-to-chromium", "1.3.693"],
      ]),
    }],
  ])],
  ["escalade", new Map([
    ["3.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-escalade-3.1.1-d8cfdc7000965c5a0174b4a82eaa5c0552742e40-integrity/node_modules/escalade/"),
      packageDependencies: new Map([
        ["escalade", "3.1.1"],
      ]),
    }],
  ])],
  ["node-releases", new Map([
    ["1.1.71", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-node-releases-1.1.71-cb1334b179896b1c89ecfdd4b725fb7bbdfc7dbb-integrity/node_modules/node-releases/"),
      packageDependencies: new Map([
        ["node-releases", "1.1.71"],
      ]),
    }],
  ])],
  ["chrome-trace-event", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-chrome-trace-event-1.0.2-234090ee97c7d4ad1a2c4beae27505deffc608a4-integrity/node_modules/chrome-trace-event/"),
      packageDependencies: new Map([
        ["tslib", "1.14.1"],
        ["chrome-trace-event", "1.0.2"],
      ]),
    }],
  ])],
  ["tslib", new Map([
    ["1.14.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-tslib-1.14.1-cf2d38bdc34a134bcaf1091c41f6619e2f672d00-integrity/node_modules/tslib/"),
      packageDependencies: new Map([
        ["tslib", "1.14.1"],
      ]),
    }],
  ])],
  ["enhanced-resolve", new Map([
    ["5.7.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-enhanced-resolve-5.7.0-525c5d856680fbd5052de453ac83e32049958b5c-integrity/node_modules/enhanced-resolve/"),
      packageDependencies: new Map([
        ["graceful-fs", "4.2.6"],
        ["tapable", "2.2.0"],
        ["enhanced-resolve", "5.7.0"],
      ]),
    }],
  ])],
  ["graceful-fs", new Map([
    ["4.2.6", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-graceful-fs-4.2.6-ff040b2b0853b23c3d31027523706f1885d76bee-integrity/node_modules/graceful-fs/"),
      packageDependencies: new Map([
        ["graceful-fs", "4.2.6"],
      ]),
    }],
  ])],
  ["tapable", new Map([
    ["2.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-tapable-2.2.0-5c373d281d9c672848213d0e037d1c4165ab426b-integrity/node_modules/tapable/"),
      packageDependencies: new Map([
        ["tapable", "2.2.0"],
      ]),
    }],
  ])],
  ["es-module-lexer", new Map([
    ["0.4.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-es-module-lexer-0.4.1-dda8c6a14d8f340a24e34331e0fab0cb50438e0e-integrity/node_modules/es-module-lexer/"),
      packageDependencies: new Map([
        ["es-module-lexer", "0.4.1"],
      ]),
    }],
  ])],
  ["eslint-scope", new Map([
    ["5.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-eslint-scope-5.1.1-e786e59a66cb92b3f6c1fb0d508aab174848f48c-integrity/node_modules/eslint-scope/"),
      packageDependencies: new Map([
        ["esrecurse", "4.3.0"],
        ["estraverse", "4.3.0"],
        ["eslint-scope", "5.1.1"],
      ]),
    }],
  ])],
  ["esrecurse", new Map([
    ["4.3.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-esrecurse-4.3.0-7ad7964d679abb28bee72cec63758b1c5d2c9921-integrity/node_modules/esrecurse/"),
      packageDependencies: new Map([
        ["estraverse", "5.2.0"],
        ["esrecurse", "4.3.0"],
      ]),
    }],
  ])],
  ["estraverse", new Map([
    ["5.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-estraverse-5.2.0-307df42547e6cc7324d3cf03c155d5cdb8c53880-integrity/node_modules/estraverse/"),
      packageDependencies: new Map([
        ["estraverse", "5.2.0"],
      ]),
    }],
    ["4.3.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-estraverse-4.3.0-398ad3f3c5a24948be7725e83d11a7de28cdbd1d-integrity/node_modules/estraverse/"),
      packageDependencies: new Map([
        ["estraverse", "4.3.0"],
      ]),
    }],
  ])],
  ["events", new Map([
    ["3.3.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-events-3.3.0-31a95ad0a924e2d2c419a813aeb2c4e878ea7400-integrity/node_modules/events/"),
      packageDependencies: new Map([
        ["events", "3.3.0"],
      ]),
    }],
  ])],
  ["glob-to-regexp", new Map([
    ["0.4.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-glob-to-regexp-0.4.1-c75297087c851b9a578bd217dd59a92f59fe546e-integrity/node_modules/glob-to-regexp/"),
      packageDependencies: new Map([
        ["glob-to-regexp", "0.4.1"],
      ]),
    }],
  ])],
  ["json-parse-better-errors", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-json-parse-better-errors-1.0.2-bb867cfb3450e69107c131d1c514bab3dc8bcaa9-integrity/node_modules/json-parse-better-errors/"),
      packageDependencies: new Map([
        ["json-parse-better-errors", "1.0.2"],
      ]),
    }],
  ])],
  ["loader-runner", new Map([
    ["4.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-loader-runner-4.2.0-d7022380d66d14c5fb1d496b89864ebcfd478384-integrity/node_modules/loader-runner/"),
      packageDependencies: new Map([
        ["loader-runner", "4.2.0"],
      ]),
    }],
  ])],
  ["mime-types", new Map([
    ["2.1.29", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-mime-types-2.1.29-1d4ab77da64b91f5f72489df29236563754bb1b2-integrity/node_modules/mime-types/"),
      packageDependencies: new Map([
        ["mime-db", "1.46.0"],
        ["mime-types", "2.1.29"],
      ]),
    }],
  ])],
  ["mime-db", new Map([
    ["1.46.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-mime-db-1.46.0-6267748a7f799594de3cbc8cde91def349661cee-integrity/node_modules/mime-db/"),
      packageDependencies: new Map([
        ["mime-db", "1.46.0"],
      ]),
    }],
  ])],
  ["neo-async", new Map([
    ["2.6.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-neo-async-2.6.2-b4aafb93e3aeb2d8174ca53cf163ab7d7308305f-integrity/node_modules/neo-async/"),
      packageDependencies: new Map([
        ["neo-async", "2.6.2"],
      ]),
    }],
  ])],
  ["schema-utils", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-schema-utils-3.0.0-67502f6aa2b66a2d4032b4279a2944978a0913ef-integrity/node_modules/schema-utils/"),
      packageDependencies: new Map([
        ["@types/json-schema", "7.0.7"],
        ["ajv", "6.12.6"],
        ["ajv-keywords", "3.5.2"],
        ["schema-utils", "3.0.0"],
      ]),
    }],
  ])],
  ["ajv", new Map([
    ["6.12.6", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-ajv-6.12.6-baf5a62e802b07d977034586f8c3baf5adf26df4-integrity/node_modules/ajv/"),
      packageDependencies: new Map([
        ["fast-deep-equal", "3.1.3"],
        ["fast-json-stable-stringify", "2.1.0"],
        ["json-schema-traverse", "0.4.1"],
        ["uri-js", "4.4.1"],
        ["ajv", "6.12.6"],
      ]),
    }],
  ])],
  ["fast-deep-equal", new Map([
    ["3.1.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-fast-deep-equal-3.1.3-3a7d56b559d6cbc3eb512325244e619a65c6c525-integrity/node_modules/fast-deep-equal/"),
      packageDependencies: new Map([
        ["fast-deep-equal", "3.1.3"],
      ]),
    }],
  ])],
  ["fast-json-stable-stringify", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-fast-json-stable-stringify-2.1.0-874bf69c6f404c2b5d99c481341399fd55892633-integrity/node_modules/fast-json-stable-stringify/"),
      packageDependencies: new Map([
        ["fast-json-stable-stringify", "2.1.0"],
      ]),
    }],
  ])],
  ["json-schema-traverse", new Map([
    ["0.4.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-json-schema-traverse-0.4.1-69f6a87d9513ab8bb8fe63bdb0979c448e684660-integrity/node_modules/json-schema-traverse/"),
      packageDependencies: new Map([
        ["json-schema-traverse", "0.4.1"],
      ]),
    }],
  ])],
  ["uri-js", new Map([
    ["4.4.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-uri-js-4.4.1-9b1a52595225859e55f669d928f88c6c57f2a77e-integrity/node_modules/uri-js/"),
      packageDependencies: new Map([
        ["punycode", "2.1.1"],
        ["uri-js", "4.4.1"],
      ]),
    }],
  ])],
  ["punycode", new Map([
    ["2.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-punycode-2.1.1-b58b010ac40c22c5657616c8d2c2c02c7bf479ec-integrity/node_modules/punycode/"),
      packageDependencies: new Map([
        ["punycode", "2.1.1"],
      ]),
    }],
  ])],
  ["ajv-keywords", new Map([
    ["3.5.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-ajv-keywords-3.5.2-31f29da5ab6e00d1c2d329acf7b5929614d5014d-integrity/node_modules/ajv-keywords/"),
      packageDependencies: new Map([
        ["ajv", "6.12.6"],
        ["ajv-keywords", "3.5.2"],
      ]),
    }],
  ])],
  ["terser-webpack-plugin", new Map([
    ["5.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-terser-webpack-plugin-5.1.1-7effadee06f7ecfa093dbbd3e9ab23f5f3ed8673-integrity/node_modules/terser-webpack-plugin/"),
      packageDependencies: new Map([
        ["jest-worker", "26.6.2"],
        ["p-limit", "3.1.0"],
        ["schema-utils", "3.0.0"],
        ["serialize-javascript", "5.0.1"],
        ["source-map", "0.6.1"],
        ["terser", "5.6.1"],
        ["terser-webpack-plugin", "5.1.1"],
      ]),
    }],
  ])],
  ["jest-worker", new Map([
    ["26.6.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-jest-worker-26.6.2-7f72cbc4d643c365e27b9fd775f9d0eaa9c7a8ed-integrity/node_modules/jest-worker/"),
      packageDependencies: new Map([
        ["@types/node", "14.14.35"],
        ["merge-stream", "2.0.0"],
        ["supports-color", "7.2.0"],
        ["jest-worker", "26.6.2"],
      ]),
    }],
  ])],
  ["@types/node", new Map([
    ["14.14.35", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@types-node-14.14.35-42c953a4e2b18ab931f72477e7012172f4ffa313-integrity/node_modules/@types/node/"),
      packageDependencies: new Map([
        ["@types/node", "14.14.35"],
      ]),
    }],
  ])],
  ["merge-stream", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-merge-stream-2.0.0-52823629a14dd00c9770fb6ad47dc6310f2c1f60-integrity/node_modules/merge-stream/"),
      packageDependencies: new Map([
        ["merge-stream", "2.0.0"],
      ]),
    }],
  ])],
  ["supports-color", new Map([
    ["7.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-supports-color-7.2.0-1b7dcdcb32b8138801b3e478ba6a51caa89648da-integrity/node_modules/supports-color/"),
      packageDependencies: new Map([
        ["has-flag", "4.0.0"],
        ["supports-color", "7.2.0"],
      ]),
    }],
  ])],
  ["has-flag", new Map([
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-has-flag-4.0.0-944771fd9c81c81265c4d6941860da06bb59479b-integrity/node_modules/has-flag/"),
      packageDependencies: new Map([
        ["has-flag", "4.0.0"],
      ]),
    }],
  ])],
  ["p-limit", new Map([
    ["3.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-p-limit-3.1.0-e1daccbe78d0d1388ca18c64fea38e3e57e3706b-integrity/node_modules/p-limit/"),
      packageDependencies: new Map([
        ["yocto-queue", "0.1.0"],
        ["p-limit", "3.1.0"],
      ]),
    }],
    ["2.3.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-p-limit-2.3.0-3dd33c647a214fdfffd835933eb086da0dc21db1-integrity/node_modules/p-limit/"),
      packageDependencies: new Map([
        ["p-try", "2.2.0"],
        ["p-limit", "2.3.0"],
      ]),
    }],
  ])],
  ["yocto-queue", new Map([
    ["0.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-yocto-queue-0.1.0-0294eb3dee05028d31ee1a5fa2c556a6aaf10a1b-integrity/node_modules/yocto-queue/"),
      packageDependencies: new Map([
        ["yocto-queue", "0.1.0"],
      ]),
    }],
  ])],
  ["serialize-javascript", new Map([
    ["5.0.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-serialize-javascript-5.0.1-7886ec848049a462467a97d3d918ebb2aaf934f4-integrity/node_modules/serialize-javascript/"),
      packageDependencies: new Map([
        ["randombytes", "2.1.0"],
        ["serialize-javascript", "5.0.1"],
      ]),
    }],
  ])],
  ["randombytes", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-randombytes-2.1.0-df6f84372f0270dc65cdf6291349ab7a473d4f2a-integrity/node_modules/randombytes/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.2.1"],
        ["randombytes", "2.1.0"],
      ]),
    }],
  ])],
  ["safe-buffer", new Map([
    ["5.2.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-safe-buffer-5.2.1-1eaf9fa9bdb1fdd4ec75f58f9cdb4e6b7827eec6-integrity/node_modules/safe-buffer/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.2.1"],
      ]),
    }],
  ])],
  ["source-map", new Map([
    ["0.6.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-source-map-0.6.1-74722af32e9614e9c287a8d0bbde48b5e2f1a263-integrity/node_modules/source-map/"),
      packageDependencies: new Map([
        ["source-map", "0.6.1"],
      ]),
    }],
    ["0.7.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-source-map-0.7.3-5302f8169031735226544092e64981f751750383-integrity/node_modules/source-map/"),
      packageDependencies: new Map([
        ["source-map", "0.7.3"],
      ]),
    }],
  ])],
  ["terser", new Map([
    ["5.6.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-terser-5.6.1-a48eeac5300c0a09b36854bf90d9c26fb201973c-integrity/node_modules/terser/"),
      packageDependencies: new Map([
        ["commander", "2.20.3"],
        ["source-map", "0.7.3"],
        ["source-map-support", "0.5.19"],
        ["terser", "5.6.1"],
      ]),
    }],
  ])],
  ["commander", new Map([
    ["2.20.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-commander-2.20.3-fd485e84c03eb4881c20722ba48035e8531aeb33-integrity/node_modules/commander/"),
      packageDependencies: new Map([
        ["commander", "2.20.3"],
      ]),
    }],
    ["7.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-commander-7.1.0-f2eaecf131f10e36e07d894698226e36ae0eb5ff-integrity/node_modules/commander/"),
      packageDependencies: new Map([
        ["commander", "7.1.0"],
      ]),
    }],
  ])],
  ["source-map-support", new Map([
    ["0.5.19", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-source-map-support-0.5.19-a98b62f86dcaf4f67399648c085291ab9e8fed61-integrity/node_modules/source-map-support/"),
      packageDependencies: new Map([
        ["buffer-from", "1.1.1"],
        ["source-map", "0.6.1"],
        ["source-map-support", "0.5.19"],
      ]),
    }],
  ])],
  ["buffer-from", new Map([
    ["1.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-buffer-from-1.1.1-32713bc028f75c02fdb710d7c7bcec1f2c6070ef-integrity/node_modules/buffer-from/"),
      packageDependencies: new Map([
        ["buffer-from", "1.1.1"],
      ]),
    }],
  ])],
  ["watchpack", new Map([
    ["2.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-watchpack-2.1.1-e99630550fca07df9f90a06056987baa40a689c7-integrity/node_modules/watchpack/"),
      packageDependencies: new Map([
        ["glob-to-regexp", "0.4.1"],
        ["graceful-fs", "4.2.6"],
        ["watchpack", "2.1.1"],
      ]),
    }],
  ])],
  ["webpack-sources", new Map([
    ["2.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-webpack-sources-2.2.0-058926f39e3d443193b6c31547229806ffd02bac-integrity/node_modules/webpack-sources/"),
      packageDependencies: new Map([
        ["source-list-map", "2.0.1"],
        ["source-map", "0.6.1"],
        ["webpack-sources", "2.2.0"],
      ]),
    }],
  ])],
  ["source-list-map", new Map([
    ["2.0.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-source-list-map-2.0.1-3993bd873bfc48479cca9ea3a547835c7c154b34-integrity/node_modules/source-list-map/"),
      packageDependencies: new Map([
        ["source-list-map", "2.0.1"],
      ]),
    }],
  ])],
  ["webpack-cli", new Map([
    ["4.5.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-webpack-cli-4.5.0-b5213b84adf6e1f5de6391334c9fa53a48850466-integrity/node_modules/webpack-cli/"),
      packageDependencies: new Map([
        ["webpack", "5.27.0"],
        ["@discoveryjs/json-ext", "0.5.2"],
        ["@webpack-cli/configtest", "1.0.1"],
        ["@webpack-cli/info", "1.2.2"],
        ["@webpack-cli/serve", "1.3.0"],
        ["colorette", "1.2.2"],
        ["commander", "7.1.0"],
        ["enquirer", "2.3.6"],
        ["execa", "5.0.0"],
        ["fastest-levenshtein", "1.0.12"],
        ["import-local", "3.0.2"],
        ["interpret", "2.2.0"],
        ["rechoir", "0.7.0"],
        ["v8-compile-cache", "2.3.0"],
        ["webpack-merge", "5.7.3"],
        ["webpack-cli", "4.5.0"],
      ]),
    }],
  ])],
  ["@discoveryjs/json-ext", new Map([
    ["0.5.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@discoveryjs-json-ext-0.5.2-8f03a22a04de437254e8ce8cc84ba39689288752-integrity/node_modules/@discoveryjs/json-ext/"),
      packageDependencies: new Map([
        ["@discoveryjs/json-ext", "0.5.2"],
      ]),
    }],
  ])],
  ["@webpack-cli/configtest", new Map([
    ["1.0.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webpack-cli-configtest-1.0.1-241aecfbdc715eee96bed447ed402e12ec171935-integrity/node_modules/@webpack-cli/configtest/"),
      packageDependencies: new Map([
        ["webpack", "5.27.0"],
        ["@webpack-cli/configtest", "1.0.1"],
      ]),
    }],
  ])],
  ["@webpack-cli/info", new Map([
    ["1.2.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webpack-cli-info-1.2.2-ef3c0cd947a1fa083e174a59cb74e0b6195c236c-integrity/node_modules/@webpack-cli/info/"),
      packageDependencies: new Map([
        ["envinfo", "7.7.4"],
        ["@webpack-cli/info", "1.2.2"],
      ]),
    }],
  ])],
  ["envinfo", new Map([
    ["7.7.4", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-envinfo-7.7.4-c6311cdd38a0e86808c1c9343f667e4267c4a320-integrity/node_modules/envinfo/"),
      packageDependencies: new Map([
        ["envinfo", "7.7.4"],
      ]),
    }],
  ])],
  ["@webpack-cli/serve", new Map([
    ["1.3.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-@webpack-cli-serve-1.3.0-2730c770f5f1f132767c63dcaaa4ec28f8c56a6c-integrity/node_modules/@webpack-cli/serve/"),
      packageDependencies: new Map([
        ["@webpack-cli/serve", "1.3.0"],
      ]),
    }],
  ])],
  ["enquirer", new Map([
    ["2.3.6", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-enquirer-2.3.6-2a7fe5dd634a1e4125a975ec994ff5456dc3734d-integrity/node_modules/enquirer/"),
      packageDependencies: new Map([
        ["ansi-colors", "4.1.1"],
        ["enquirer", "2.3.6"],
      ]),
    }],
  ])],
  ["ansi-colors", new Map([
    ["4.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-ansi-colors-4.1.1-cbb9ae256bf750af1eab344f229aa27fe94ba348-integrity/node_modules/ansi-colors/"),
      packageDependencies: new Map([
        ["ansi-colors", "4.1.1"],
      ]),
    }],
  ])],
  ["execa", new Map([
    ["5.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-execa-5.0.0-4029b0007998a841fbd1032e5f4de86a3c1e3376-integrity/node_modules/execa/"),
      packageDependencies: new Map([
        ["cross-spawn", "7.0.3"],
        ["get-stream", "6.0.0"],
        ["human-signals", "2.1.0"],
        ["is-stream", "2.0.0"],
        ["merge-stream", "2.0.0"],
        ["npm-run-path", "4.0.1"],
        ["onetime", "5.1.2"],
        ["signal-exit", "3.0.3"],
        ["strip-final-newline", "2.0.0"],
        ["execa", "5.0.0"],
      ]),
    }],
  ])],
  ["cross-spawn", new Map([
    ["7.0.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-cross-spawn-7.0.3-f73a85b9d5d41d045551c177e2882d4ac85728a6-integrity/node_modules/cross-spawn/"),
      packageDependencies: new Map([
        ["path-key", "3.1.1"],
        ["shebang-command", "2.0.0"],
        ["which", "2.0.2"],
        ["cross-spawn", "7.0.3"],
      ]),
    }],
  ])],
  ["path-key", new Map([
    ["3.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-path-key-3.1.1-581f6ade658cbba65a0d3380de7753295054f375-integrity/node_modules/path-key/"),
      packageDependencies: new Map([
        ["path-key", "3.1.1"],
      ]),
    }],
  ])],
  ["shebang-command", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-shebang-command-2.0.0-ccd0af4f8835fbdc265b82461aaf0c36663f34ea-integrity/node_modules/shebang-command/"),
      packageDependencies: new Map([
        ["shebang-regex", "3.0.0"],
        ["shebang-command", "2.0.0"],
      ]),
    }],
  ])],
  ["shebang-regex", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-shebang-regex-3.0.0-ae16f1644d873ecad843b0307b143362d4c42172-integrity/node_modules/shebang-regex/"),
      packageDependencies: new Map([
        ["shebang-regex", "3.0.0"],
      ]),
    }],
  ])],
  ["which", new Map([
    ["2.0.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-which-2.0.2-7c6a8dd0a636a0327e10b59c9286eee93f3f51b1-integrity/node_modules/which/"),
      packageDependencies: new Map([
        ["isexe", "2.0.0"],
        ["which", "2.0.2"],
      ]),
    }],
  ])],
  ["isexe", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-isexe-2.0.0-e8fbf374dc556ff8947a10dcb0572d633f2cfa10-integrity/node_modules/isexe/"),
      packageDependencies: new Map([
        ["isexe", "2.0.0"],
      ]),
    }],
  ])],
  ["get-stream", new Map([
    ["6.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-get-stream-6.0.0-3e0012cb6827319da2706e601a1583e8629a6718-integrity/node_modules/get-stream/"),
      packageDependencies: new Map([
        ["get-stream", "6.0.0"],
      ]),
    }],
  ])],
  ["human-signals", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-human-signals-2.1.0-dc91fcba42e4d06e4abaed33b3e7a3c02f514ea0-integrity/node_modules/human-signals/"),
      packageDependencies: new Map([
        ["human-signals", "2.1.0"],
      ]),
    }],
  ])],
  ["is-stream", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-is-stream-2.0.0-bde9c32680d6fae04129d6ac9d921ce7815f78e3-integrity/node_modules/is-stream/"),
      packageDependencies: new Map([
        ["is-stream", "2.0.0"],
      ]),
    }],
  ])],
  ["npm-run-path", new Map([
    ["4.0.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-npm-run-path-4.0.1-b7ecd1e5ed53da8e37a55e1c2269e0b97ed748ea-integrity/node_modules/npm-run-path/"),
      packageDependencies: new Map([
        ["path-key", "3.1.1"],
        ["npm-run-path", "4.0.1"],
      ]),
    }],
  ])],
  ["onetime", new Map([
    ["5.1.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-onetime-5.1.2-d0e96ebb56b07476df1dd9c4806e5237985ca45e-integrity/node_modules/onetime/"),
      packageDependencies: new Map([
        ["mimic-fn", "2.1.0"],
        ["onetime", "5.1.2"],
      ]),
    }],
  ])],
  ["mimic-fn", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-mimic-fn-2.1.0-7ed2c2ccccaf84d3ffcb7a69b57711fc2083401b-integrity/node_modules/mimic-fn/"),
      packageDependencies: new Map([
        ["mimic-fn", "2.1.0"],
      ]),
    }],
  ])],
  ["signal-exit", new Map([
    ["3.0.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-signal-exit-3.0.3-a1410c2edd8f077b08b4e253c8eacfcaf057461c-integrity/node_modules/signal-exit/"),
      packageDependencies: new Map([
        ["signal-exit", "3.0.3"],
      ]),
    }],
  ])],
  ["strip-final-newline", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-strip-final-newline-2.0.0-89b852fb2fcbe936f6f4b3187afb0a12c1ab58ad-integrity/node_modules/strip-final-newline/"),
      packageDependencies: new Map([
        ["strip-final-newline", "2.0.0"],
      ]),
    }],
  ])],
  ["fastest-levenshtein", new Map([
    ["1.0.12", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-fastest-levenshtein-1.0.12-9990f7d3a88cc5a9ffd1f1745745251700d497e2-integrity/node_modules/fastest-levenshtein/"),
      packageDependencies: new Map([
        ["fastest-levenshtein", "1.0.12"],
      ]),
    }],
  ])],
  ["import-local", new Map([
    ["3.0.2", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-import-local-3.0.2-a8cfd0431d1de4a2199703d003e3e62364fa6db6-integrity/node_modules/import-local/"),
      packageDependencies: new Map([
        ["pkg-dir", "4.2.0"],
        ["resolve-cwd", "3.0.0"],
        ["import-local", "3.0.2"],
      ]),
    }],
  ])],
  ["pkg-dir", new Map([
    ["4.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-pkg-dir-4.2.0-f099133df7ede422e81d1d8448270eeb3e4261f3-integrity/node_modules/pkg-dir/"),
      packageDependencies: new Map([
        ["find-up", "4.1.0"],
        ["pkg-dir", "4.2.0"],
      ]),
    }],
  ])],
  ["find-up", new Map([
    ["4.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-find-up-4.1.0-97afe7d6cdc0bc5928584b7c8d7b16e8a9aa5d19-integrity/node_modules/find-up/"),
      packageDependencies: new Map([
        ["locate-path", "5.0.0"],
        ["path-exists", "4.0.0"],
        ["find-up", "4.1.0"],
      ]),
    }],
  ])],
  ["locate-path", new Map([
    ["5.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-locate-path-5.0.0-1afba396afd676a6d42504d0a67a3a7eb9f62aa0-integrity/node_modules/locate-path/"),
      packageDependencies: new Map([
        ["p-locate", "4.1.0"],
        ["locate-path", "5.0.0"],
      ]),
    }],
  ])],
  ["p-locate", new Map([
    ["4.1.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-p-locate-4.1.0-a3428bb7088b3a60292f66919278b7c297ad4f07-integrity/node_modules/p-locate/"),
      packageDependencies: new Map([
        ["p-limit", "2.3.0"],
        ["p-locate", "4.1.0"],
      ]),
    }],
  ])],
  ["p-try", new Map([
    ["2.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-p-try-2.2.0-cb2868540e313d61de58fafbe35ce9004d5540e6-integrity/node_modules/p-try/"),
      packageDependencies: new Map([
        ["p-try", "2.2.0"],
      ]),
    }],
  ])],
  ["path-exists", new Map([
    ["4.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-path-exists-4.0.0-513bdbe2d3b95d7762e8c1137efa195c6c61b5b3-integrity/node_modules/path-exists/"),
      packageDependencies: new Map([
        ["path-exists", "4.0.0"],
      ]),
    }],
  ])],
  ["resolve-cwd", new Map([
    ["3.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-resolve-cwd-3.0.0-0f0075f1bb2544766cf73ba6a6e2adfebcb13f2d-integrity/node_modules/resolve-cwd/"),
      packageDependencies: new Map([
        ["resolve-from", "5.0.0"],
        ["resolve-cwd", "3.0.0"],
      ]),
    }],
  ])],
  ["resolve-from", new Map([
    ["5.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-resolve-from-5.0.0-c35225843df8f776df21c57557bc087e9dfdfc69-integrity/node_modules/resolve-from/"),
      packageDependencies: new Map([
        ["resolve-from", "5.0.0"],
      ]),
    }],
  ])],
  ["interpret", new Map([
    ["2.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-interpret-2.2.0-1a78a0b5965c40a5416d007ad6f50ad27c417df9-integrity/node_modules/interpret/"),
      packageDependencies: new Map([
        ["interpret", "2.2.0"],
      ]),
    }],
  ])],
  ["rechoir", new Map([
    ["0.7.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-rechoir-0.7.0-32650fd52c21ab252aa5d65b19310441c7e03aca-integrity/node_modules/rechoir/"),
      packageDependencies: new Map([
        ["resolve", "1.20.0"],
        ["rechoir", "0.7.0"],
      ]),
    }],
  ])],
  ["resolve", new Map([
    ["1.20.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-resolve-1.20.0-629a013fb3f70755d6f0b7935cc1c2c5378b1975-integrity/node_modules/resolve/"),
      packageDependencies: new Map([
        ["is-core-module", "2.2.0"],
        ["path-parse", "1.0.6"],
        ["resolve", "1.20.0"],
      ]),
    }],
  ])],
  ["is-core-module", new Map([
    ["2.2.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-is-core-module-2.2.0-97037ef3d52224d85163f5597b2b63d9afed981a-integrity/node_modules/is-core-module/"),
      packageDependencies: new Map([
        ["has", "1.0.3"],
        ["is-core-module", "2.2.0"],
      ]),
    }],
  ])],
  ["has", new Map([
    ["1.0.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-has-1.0.3-722d7cbfc1f6aa8241f16dd814e011e1f41e8796-integrity/node_modules/has/"),
      packageDependencies: new Map([
        ["function-bind", "1.1.1"],
        ["has", "1.0.3"],
      ]),
    }],
  ])],
  ["function-bind", new Map([
    ["1.1.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-function-bind-1.1.1-a56899d3ea3c9bab874bb9773b7c5ede92f4895d-integrity/node_modules/function-bind/"),
      packageDependencies: new Map([
        ["function-bind", "1.1.1"],
      ]),
    }],
  ])],
  ["path-parse", new Map([
    ["1.0.6", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-path-parse-1.0.6-d62dbb5679405d72c4737ec58600e9ddcf06d24c-integrity/node_modules/path-parse/"),
      packageDependencies: new Map([
        ["path-parse", "1.0.6"],
      ]),
    }],
  ])],
  ["v8-compile-cache", new Map([
    ["2.3.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-v8-compile-cache-2.3.0-2de19618c66dc247dcfb6f99338035d8245a2cee-integrity/node_modules/v8-compile-cache/"),
      packageDependencies: new Map([
        ["v8-compile-cache", "2.3.0"],
      ]),
    }],
  ])],
  ["webpack-merge", new Map([
    ["5.7.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-webpack-merge-5.7.3-2a0754e1877a25a8bbab3d2475ca70a052708213-integrity/node_modules/webpack-merge/"),
      packageDependencies: new Map([
        ["clone-deep", "4.0.1"],
        ["wildcard", "2.0.0"],
        ["webpack-merge", "5.7.3"],
      ]),
    }],
  ])],
  ["clone-deep", new Map([
    ["4.0.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-clone-deep-4.0.1-c19fd9bdbbf85942b4fd979c84dcf7d5f07c2387-integrity/node_modules/clone-deep/"),
      packageDependencies: new Map([
        ["is-plain-object", "2.0.4"],
        ["kind-of", "6.0.3"],
        ["shallow-clone", "3.0.1"],
        ["clone-deep", "4.0.1"],
      ]),
    }],
  ])],
  ["is-plain-object", new Map([
    ["2.0.4", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-is-plain-object-2.0.4-2c163b3fafb1b606d9d17928f05c2a1c38e07677-integrity/node_modules/is-plain-object/"),
      packageDependencies: new Map([
        ["isobject", "3.0.1"],
        ["is-plain-object", "2.0.4"],
      ]),
    }],
  ])],
  ["isobject", new Map([
    ["3.0.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-isobject-3.0.1-4e431e92b11a9731636aa1f9c8d1ccbcfdab78df-integrity/node_modules/isobject/"),
      packageDependencies: new Map([
        ["isobject", "3.0.1"],
      ]),
    }],
  ])],
  ["kind-of", new Map([
    ["6.0.3", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-kind-of-6.0.3-07c05034a6c349fa06e24fa35aa76db4580ce4dd-integrity/node_modules/kind-of/"),
      packageDependencies: new Map([
        ["kind-of", "6.0.3"],
      ]),
    }],
  ])],
  ["shallow-clone", new Map([
    ["3.0.1", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-shallow-clone-3.0.1-8f2981ad92531f55035b01fb230769a40e02efa3-integrity/node_modules/shallow-clone/"),
      packageDependencies: new Map([
        ["kind-of", "6.0.3"],
        ["shallow-clone", "3.0.1"],
      ]),
    }],
  ])],
  ["wildcard", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../../../../../Library/Caches/Yarn/v6/npm-wildcard-2.0.0-a77d20e5200c6faaac979e4b3aadc7b3dd7f8fec-integrity/node_modules/wildcard/"),
      packageDependencies: new Map([
        ["wildcard", "2.0.0"],
      ]),
    }],
  ])],
  [null, new Map([
    [null, {
      packageLocation: path.resolve(__dirname, "./"),
      packageDependencies: new Map([
        ["webpack", "5.27.0"],
        ["webpack-cli", "4.5.0"],
      ]),
    }],
  ])],
]);

let locatorsByLocations = new Map([
  ["../../../../../../Library/Caches/Yarn/v6/npm-webpack-5.27.0-387458f83142253f2759e22415dc1359746e6940-integrity/node_modules/webpack/", {"name":"webpack","reference":"5.27.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@types-eslint-scope-3.7.0-4792816e31119ebd506902a482caec4951fabd86-integrity/node_modules/@types/eslint-scope/", {"name":"@types/eslint-scope","reference":"3.7.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@types-eslint-7.2.7-f7ef1cf0dceab0ae6f9a976a0a9af14ab1baca26-integrity/node_modules/@types/eslint/", {"name":"@types/eslint","reference":"7.2.7"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@types-estree-0.0.46-0fb6bfbbeabd7a30880504993369c4bf1deab1fe-integrity/node_modules/@types/estree/", {"name":"@types/estree","reference":"0.0.46"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@types-json-schema-7.0.7-98a993516c859eb0d5c4c8f098317a9ea68db9ad-integrity/node_modules/@types/json-schema/", {"name":"@types/json-schema","reference":"7.0.7"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-ast-1.11.0-a5aa679efdc9e51707a4207139da57920555961f-integrity/node_modules/@webassemblyjs/ast/", {"name":"@webassemblyjs/ast","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-numbers-1.11.0-7ab04172d54e312cc6ea4286d7d9fa27c88cd4f9-integrity/node_modules/@webassemblyjs/helper-numbers/", {"name":"@webassemblyjs/helper-numbers","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-floating-point-hex-parser-1.11.0-34d62052f453cd43101d72eab4966a022587947c-integrity/node_modules/@webassemblyjs/floating-point-hex-parser/", {"name":"@webassemblyjs/floating-point-hex-parser","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-api-error-1.11.0-aaea8fb3b923f4aaa9b512ff541b013ffb68d2d4-integrity/node_modules/@webassemblyjs/helper-api-error/", {"name":"@webassemblyjs/helper-api-error","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@xtuc-long-4.2.2-d291c6a4e97989b5c61d9acf396ae4fe133a718d-integrity/node_modules/@xtuc/long/", {"name":"@xtuc/long","reference":"4.2.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-wasm-bytecode-1.11.0-85fdcda4129902fe86f81abf7e7236953ec5a4e1-integrity/node_modules/@webassemblyjs/helper-wasm-bytecode/", {"name":"@webassemblyjs/helper-wasm-bytecode","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-edit-1.11.0-ee4a5c9f677046a210542ae63897094c2027cb78-integrity/node_modules/@webassemblyjs/wasm-edit/", {"name":"@webassemblyjs/wasm-edit","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-buffer-1.11.0-d026c25d175e388a7dbda9694e91e743cbe9b642-integrity/node_modules/@webassemblyjs/helper-buffer/", {"name":"@webassemblyjs/helper-buffer","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-helper-wasm-section-1.11.0-9ce2cc89300262509c801b4af113d1ca25c1a75b-integrity/node_modules/@webassemblyjs/helper-wasm-section/", {"name":"@webassemblyjs/helper-wasm-section","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-gen-1.11.0-3cdb35e70082d42a35166988dda64f24ceb97abe-integrity/node_modules/@webassemblyjs/wasm-gen/", {"name":"@webassemblyjs/wasm-gen","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-ieee754-1.11.0-46975d583f9828f5d094ac210e219441c4e6f5cf-integrity/node_modules/@webassemblyjs/ieee754/", {"name":"@webassemblyjs/ieee754","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@xtuc-ieee754-1.2.0-eef014a3145ae477a1cbc00cd1e552336dceb790-integrity/node_modules/@xtuc/ieee754/", {"name":"@xtuc/ieee754","reference":"1.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-leb128-1.11.0-f7353de1df38aa201cba9fb88b43f41f75ff403b-integrity/node_modules/@webassemblyjs/leb128/", {"name":"@webassemblyjs/leb128","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-utf8-1.11.0-86e48f959cf49e0e5091f069a709b862f5a2cadf-integrity/node_modules/@webassemblyjs/utf8/", {"name":"@webassemblyjs/utf8","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-opt-1.11.0-1638ae188137f4bb031f568a413cd24d32f92978-integrity/node_modules/@webassemblyjs/wasm-opt/", {"name":"@webassemblyjs/wasm-opt","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wasm-parser-1.11.0-3e680b8830d5b13d1ec86cc42f38f3d4a7700754-integrity/node_modules/@webassemblyjs/wasm-parser/", {"name":"@webassemblyjs/wasm-parser","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webassemblyjs-wast-printer-1.11.0-680d1f6a5365d6d401974a8e949e05474e1fab7e-integrity/node_modules/@webassemblyjs/wast-printer/", {"name":"@webassemblyjs/wast-printer","reference":"1.11.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-acorn-8.1.0-52311fd7037ae119cbb134309e901aa46295b3fe-integrity/node_modules/acorn/", {"name":"acorn","reference":"8.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-browserslist-4.16.3-340aa46940d7db878748567c5dea24a48ddf3717-integrity/node_modules/browserslist/", {"name":"browserslist","reference":"4.16.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-caniuse-lite-1.0.30001203-a7a34df21a387d9deffcd56c000b8cf5ab540580-integrity/node_modules/caniuse-lite/", {"name":"caniuse-lite","reference":"1.0.30001203"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-colorette-1.2.2-cbcc79d5e99caea2dbf10eb3a26fd8b3e6acfa94-integrity/node_modules/colorette/", {"name":"colorette","reference":"1.2.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-electron-to-chromium-1.3.693-5089c506a925c31f93fcb173a003a22e341115dd-integrity/node_modules/electron-to-chromium/", {"name":"electron-to-chromium","reference":"1.3.693"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-escalade-3.1.1-d8cfdc7000965c5a0174b4a82eaa5c0552742e40-integrity/node_modules/escalade/", {"name":"escalade","reference":"3.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-node-releases-1.1.71-cb1334b179896b1c89ecfdd4b725fb7bbdfc7dbb-integrity/node_modules/node-releases/", {"name":"node-releases","reference":"1.1.71"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-chrome-trace-event-1.0.2-234090ee97c7d4ad1a2c4beae27505deffc608a4-integrity/node_modules/chrome-trace-event/", {"name":"chrome-trace-event","reference":"1.0.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-tslib-1.14.1-cf2d38bdc34a134bcaf1091c41f6619e2f672d00-integrity/node_modules/tslib/", {"name":"tslib","reference":"1.14.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-enhanced-resolve-5.7.0-525c5d856680fbd5052de453ac83e32049958b5c-integrity/node_modules/enhanced-resolve/", {"name":"enhanced-resolve","reference":"5.7.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-graceful-fs-4.2.6-ff040b2b0853b23c3d31027523706f1885d76bee-integrity/node_modules/graceful-fs/", {"name":"graceful-fs","reference":"4.2.6"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-tapable-2.2.0-5c373d281d9c672848213d0e037d1c4165ab426b-integrity/node_modules/tapable/", {"name":"tapable","reference":"2.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-es-module-lexer-0.4.1-dda8c6a14d8f340a24e34331e0fab0cb50438e0e-integrity/node_modules/es-module-lexer/", {"name":"es-module-lexer","reference":"0.4.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-eslint-scope-5.1.1-e786e59a66cb92b3f6c1fb0d508aab174848f48c-integrity/node_modules/eslint-scope/", {"name":"eslint-scope","reference":"5.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-esrecurse-4.3.0-7ad7964d679abb28bee72cec63758b1c5d2c9921-integrity/node_modules/esrecurse/", {"name":"esrecurse","reference":"4.3.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-estraverse-5.2.0-307df42547e6cc7324d3cf03c155d5cdb8c53880-integrity/node_modules/estraverse/", {"name":"estraverse","reference":"5.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-estraverse-4.3.0-398ad3f3c5a24948be7725e83d11a7de28cdbd1d-integrity/node_modules/estraverse/", {"name":"estraverse","reference":"4.3.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-events-3.3.0-31a95ad0a924e2d2c419a813aeb2c4e878ea7400-integrity/node_modules/events/", {"name":"events","reference":"3.3.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-glob-to-regexp-0.4.1-c75297087c851b9a578bd217dd59a92f59fe546e-integrity/node_modules/glob-to-regexp/", {"name":"glob-to-regexp","reference":"0.4.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-json-parse-better-errors-1.0.2-bb867cfb3450e69107c131d1c514bab3dc8bcaa9-integrity/node_modules/json-parse-better-errors/", {"name":"json-parse-better-errors","reference":"1.0.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-loader-runner-4.2.0-d7022380d66d14c5fb1d496b89864ebcfd478384-integrity/node_modules/loader-runner/", {"name":"loader-runner","reference":"4.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-mime-types-2.1.29-1d4ab77da64b91f5f72489df29236563754bb1b2-integrity/node_modules/mime-types/", {"name":"mime-types","reference":"2.1.29"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-mime-db-1.46.0-6267748a7f799594de3cbc8cde91def349661cee-integrity/node_modules/mime-db/", {"name":"mime-db","reference":"1.46.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-neo-async-2.6.2-b4aafb93e3aeb2d8174ca53cf163ab7d7308305f-integrity/node_modules/neo-async/", {"name":"neo-async","reference":"2.6.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-schema-utils-3.0.0-67502f6aa2b66a2d4032b4279a2944978a0913ef-integrity/node_modules/schema-utils/", {"name":"schema-utils","reference":"3.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-ajv-6.12.6-baf5a62e802b07d977034586f8c3baf5adf26df4-integrity/node_modules/ajv/", {"name":"ajv","reference":"6.12.6"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-fast-deep-equal-3.1.3-3a7d56b559d6cbc3eb512325244e619a65c6c525-integrity/node_modules/fast-deep-equal/", {"name":"fast-deep-equal","reference":"3.1.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-fast-json-stable-stringify-2.1.0-874bf69c6f404c2b5d99c481341399fd55892633-integrity/node_modules/fast-json-stable-stringify/", {"name":"fast-json-stable-stringify","reference":"2.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-json-schema-traverse-0.4.1-69f6a87d9513ab8bb8fe63bdb0979c448e684660-integrity/node_modules/json-schema-traverse/", {"name":"json-schema-traverse","reference":"0.4.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-uri-js-4.4.1-9b1a52595225859e55f669d928f88c6c57f2a77e-integrity/node_modules/uri-js/", {"name":"uri-js","reference":"4.4.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-punycode-2.1.1-b58b010ac40c22c5657616c8d2c2c02c7bf479ec-integrity/node_modules/punycode/", {"name":"punycode","reference":"2.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-ajv-keywords-3.5.2-31f29da5ab6e00d1c2d329acf7b5929614d5014d-integrity/node_modules/ajv-keywords/", {"name":"ajv-keywords","reference":"3.5.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-terser-webpack-plugin-5.1.1-7effadee06f7ecfa093dbbd3e9ab23f5f3ed8673-integrity/node_modules/terser-webpack-plugin/", {"name":"terser-webpack-plugin","reference":"5.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-jest-worker-26.6.2-7f72cbc4d643c365e27b9fd775f9d0eaa9c7a8ed-integrity/node_modules/jest-worker/", {"name":"jest-worker","reference":"26.6.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@types-node-14.14.35-42c953a4e2b18ab931f72477e7012172f4ffa313-integrity/node_modules/@types/node/", {"name":"@types/node","reference":"14.14.35"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-merge-stream-2.0.0-52823629a14dd00c9770fb6ad47dc6310f2c1f60-integrity/node_modules/merge-stream/", {"name":"merge-stream","reference":"2.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-supports-color-7.2.0-1b7dcdcb32b8138801b3e478ba6a51caa89648da-integrity/node_modules/supports-color/", {"name":"supports-color","reference":"7.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-has-flag-4.0.0-944771fd9c81c81265c4d6941860da06bb59479b-integrity/node_modules/has-flag/", {"name":"has-flag","reference":"4.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-p-limit-3.1.0-e1daccbe78d0d1388ca18c64fea38e3e57e3706b-integrity/node_modules/p-limit/", {"name":"p-limit","reference":"3.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-p-limit-2.3.0-3dd33c647a214fdfffd835933eb086da0dc21db1-integrity/node_modules/p-limit/", {"name":"p-limit","reference":"2.3.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-yocto-queue-0.1.0-0294eb3dee05028d31ee1a5fa2c556a6aaf10a1b-integrity/node_modules/yocto-queue/", {"name":"yocto-queue","reference":"0.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-serialize-javascript-5.0.1-7886ec848049a462467a97d3d918ebb2aaf934f4-integrity/node_modules/serialize-javascript/", {"name":"serialize-javascript","reference":"5.0.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-randombytes-2.1.0-df6f84372f0270dc65cdf6291349ab7a473d4f2a-integrity/node_modules/randombytes/", {"name":"randombytes","reference":"2.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-safe-buffer-5.2.1-1eaf9fa9bdb1fdd4ec75f58f9cdb4e6b7827eec6-integrity/node_modules/safe-buffer/", {"name":"safe-buffer","reference":"5.2.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-source-map-0.6.1-74722af32e9614e9c287a8d0bbde48b5e2f1a263-integrity/node_modules/source-map/", {"name":"source-map","reference":"0.6.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-source-map-0.7.3-5302f8169031735226544092e64981f751750383-integrity/node_modules/source-map/", {"name":"source-map","reference":"0.7.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-terser-5.6.1-a48eeac5300c0a09b36854bf90d9c26fb201973c-integrity/node_modules/terser/", {"name":"terser","reference":"5.6.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-commander-2.20.3-fd485e84c03eb4881c20722ba48035e8531aeb33-integrity/node_modules/commander/", {"name":"commander","reference":"2.20.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-commander-7.1.0-f2eaecf131f10e36e07d894698226e36ae0eb5ff-integrity/node_modules/commander/", {"name":"commander","reference":"7.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-source-map-support-0.5.19-a98b62f86dcaf4f67399648c085291ab9e8fed61-integrity/node_modules/source-map-support/", {"name":"source-map-support","reference":"0.5.19"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-buffer-from-1.1.1-32713bc028f75c02fdb710d7c7bcec1f2c6070ef-integrity/node_modules/buffer-from/", {"name":"buffer-from","reference":"1.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-watchpack-2.1.1-e99630550fca07df9f90a06056987baa40a689c7-integrity/node_modules/watchpack/", {"name":"watchpack","reference":"2.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-webpack-sources-2.2.0-058926f39e3d443193b6c31547229806ffd02bac-integrity/node_modules/webpack-sources/", {"name":"webpack-sources","reference":"2.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-source-list-map-2.0.1-3993bd873bfc48479cca9ea3a547835c7c154b34-integrity/node_modules/source-list-map/", {"name":"source-list-map","reference":"2.0.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-webpack-cli-4.5.0-b5213b84adf6e1f5de6391334c9fa53a48850466-integrity/node_modules/webpack-cli/", {"name":"webpack-cli","reference":"4.5.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@discoveryjs-json-ext-0.5.2-8f03a22a04de437254e8ce8cc84ba39689288752-integrity/node_modules/@discoveryjs/json-ext/", {"name":"@discoveryjs/json-ext","reference":"0.5.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webpack-cli-configtest-1.0.1-241aecfbdc715eee96bed447ed402e12ec171935-integrity/node_modules/@webpack-cli/configtest/", {"name":"@webpack-cli/configtest","reference":"1.0.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webpack-cli-info-1.2.2-ef3c0cd947a1fa083e174a59cb74e0b6195c236c-integrity/node_modules/@webpack-cli/info/", {"name":"@webpack-cli/info","reference":"1.2.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-envinfo-7.7.4-c6311cdd38a0e86808c1c9343f667e4267c4a320-integrity/node_modules/envinfo/", {"name":"envinfo","reference":"7.7.4"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-@webpack-cli-serve-1.3.0-2730c770f5f1f132767c63dcaaa4ec28f8c56a6c-integrity/node_modules/@webpack-cli/serve/", {"name":"@webpack-cli/serve","reference":"1.3.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-enquirer-2.3.6-2a7fe5dd634a1e4125a975ec994ff5456dc3734d-integrity/node_modules/enquirer/", {"name":"enquirer","reference":"2.3.6"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-ansi-colors-4.1.1-cbb9ae256bf750af1eab344f229aa27fe94ba348-integrity/node_modules/ansi-colors/", {"name":"ansi-colors","reference":"4.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-execa-5.0.0-4029b0007998a841fbd1032e5f4de86a3c1e3376-integrity/node_modules/execa/", {"name":"execa","reference":"5.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-cross-spawn-7.0.3-f73a85b9d5d41d045551c177e2882d4ac85728a6-integrity/node_modules/cross-spawn/", {"name":"cross-spawn","reference":"7.0.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-path-key-3.1.1-581f6ade658cbba65a0d3380de7753295054f375-integrity/node_modules/path-key/", {"name":"path-key","reference":"3.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-shebang-command-2.0.0-ccd0af4f8835fbdc265b82461aaf0c36663f34ea-integrity/node_modules/shebang-command/", {"name":"shebang-command","reference":"2.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-shebang-regex-3.0.0-ae16f1644d873ecad843b0307b143362d4c42172-integrity/node_modules/shebang-regex/", {"name":"shebang-regex","reference":"3.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-which-2.0.2-7c6a8dd0a636a0327e10b59c9286eee93f3f51b1-integrity/node_modules/which/", {"name":"which","reference":"2.0.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-isexe-2.0.0-e8fbf374dc556ff8947a10dcb0572d633f2cfa10-integrity/node_modules/isexe/", {"name":"isexe","reference":"2.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-get-stream-6.0.0-3e0012cb6827319da2706e601a1583e8629a6718-integrity/node_modules/get-stream/", {"name":"get-stream","reference":"6.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-human-signals-2.1.0-dc91fcba42e4d06e4abaed33b3e7a3c02f514ea0-integrity/node_modules/human-signals/", {"name":"human-signals","reference":"2.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-is-stream-2.0.0-bde9c32680d6fae04129d6ac9d921ce7815f78e3-integrity/node_modules/is-stream/", {"name":"is-stream","reference":"2.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-npm-run-path-4.0.1-b7ecd1e5ed53da8e37a55e1c2269e0b97ed748ea-integrity/node_modules/npm-run-path/", {"name":"npm-run-path","reference":"4.0.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-onetime-5.1.2-d0e96ebb56b07476df1dd9c4806e5237985ca45e-integrity/node_modules/onetime/", {"name":"onetime","reference":"5.1.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-mimic-fn-2.1.0-7ed2c2ccccaf84d3ffcb7a69b57711fc2083401b-integrity/node_modules/mimic-fn/", {"name":"mimic-fn","reference":"2.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-signal-exit-3.0.3-a1410c2edd8f077b08b4e253c8eacfcaf057461c-integrity/node_modules/signal-exit/", {"name":"signal-exit","reference":"3.0.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-strip-final-newline-2.0.0-89b852fb2fcbe936f6f4b3187afb0a12c1ab58ad-integrity/node_modules/strip-final-newline/", {"name":"strip-final-newline","reference":"2.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-fastest-levenshtein-1.0.12-9990f7d3a88cc5a9ffd1f1745745251700d497e2-integrity/node_modules/fastest-levenshtein/", {"name":"fastest-levenshtein","reference":"1.0.12"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-import-local-3.0.2-a8cfd0431d1de4a2199703d003e3e62364fa6db6-integrity/node_modules/import-local/", {"name":"import-local","reference":"3.0.2"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-pkg-dir-4.2.0-f099133df7ede422e81d1d8448270eeb3e4261f3-integrity/node_modules/pkg-dir/", {"name":"pkg-dir","reference":"4.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-find-up-4.1.0-97afe7d6cdc0bc5928584b7c8d7b16e8a9aa5d19-integrity/node_modules/find-up/", {"name":"find-up","reference":"4.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-locate-path-5.0.0-1afba396afd676a6d42504d0a67a3a7eb9f62aa0-integrity/node_modules/locate-path/", {"name":"locate-path","reference":"5.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-p-locate-4.1.0-a3428bb7088b3a60292f66919278b7c297ad4f07-integrity/node_modules/p-locate/", {"name":"p-locate","reference":"4.1.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-p-try-2.2.0-cb2868540e313d61de58fafbe35ce9004d5540e6-integrity/node_modules/p-try/", {"name":"p-try","reference":"2.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-path-exists-4.0.0-513bdbe2d3b95d7762e8c1137efa195c6c61b5b3-integrity/node_modules/path-exists/", {"name":"path-exists","reference":"4.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-resolve-cwd-3.0.0-0f0075f1bb2544766cf73ba6a6e2adfebcb13f2d-integrity/node_modules/resolve-cwd/", {"name":"resolve-cwd","reference":"3.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-resolve-from-5.0.0-c35225843df8f776df21c57557bc087e9dfdfc69-integrity/node_modules/resolve-from/", {"name":"resolve-from","reference":"5.0.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-interpret-2.2.0-1a78a0b5965c40a5416d007ad6f50ad27c417df9-integrity/node_modules/interpret/", {"name":"interpret","reference":"2.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-rechoir-0.7.0-32650fd52c21ab252aa5d65b19310441c7e03aca-integrity/node_modules/rechoir/", {"name":"rechoir","reference":"0.7.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-resolve-1.20.0-629a013fb3f70755d6f0b7935cc1c2c5378b1975-integrity/node_modules/resolve/", {"name":"resolve","reference":"1.20.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-is-core-module-2.2.0-97037ef3d52224d85163f5597b2b63d9afed981a-integrity/node_modules/is-core-module/", {"name":"is-core-module","reference":"2.2.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-has-1.0.3-722d7cbfc1f6aa8241f16dd814e011e1f41e8796-integrity/node_modules/has/", {"name":"has","reference":"1.0.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-function-bind-1.1.1-a56899d3ea3c9bab874bb9773b7c5ede92f4895d-integrity/node_modules/function-bind/", {"name":"function-bind","reference":"1.1.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-path-parse-1.0.6-d62dbb5679405d72c4737ec58600e9ddcf06d24c-integrity/node_modules/path-parse/", {"name":"path-parse","reference":"1.0.6"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-v8-compile-cache-2.3.0-2de19618c66dc247dcfb6f99338035d8245a2cee-integrity/node_modules/v8-compile-cache/", {"name":"v8-compile-cache","reference":"2.3.0"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-webpack-merge-5.7.3-2a0754e1877a25a8bbab3d2475ca70a052708213-integrity/node_modules/webpack-merge/", {"name":"webpack-merge","reference":"5.7.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-clone-deep-4.0.1-c19fd9bdbbf85942b4fd979c84dcf7d5f07c2387-integrity/node_modules/clone-deep/", {"name":"clone-deep","reference":"4.0.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-is-plain-object-2.0.4-2c163b3fafb1b606d9d17928f05c2a1c38e07677-integrity/node_modules/is-plain-object/", {"name":"is-plain-object","reference":"2.0.4"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-isobject-3.0.1-4e431e92b11a9731636aa1f9c8d1ccbcfdab78df-integrity/node_modules/isobject/", {"name":"isobject","reference":"3.0.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-kind-of-6.0.3-07c05034a6c349fa06e24fa35aa76db4580ce4dd-integrity/node_modules/kind-of/", {"name":"kind-of","reference":"6.0.3"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-shallow-clone-3.0.1-8f2981ad92531f55035b01fb230769a40e02efa3-integrity/node_modules/shallow-clone/", {"name":"shallow-clone","reference":"3.0.1"}],
  ["../../../../../../Library/Caches/Yarn/v6/npm-wildcard-2.0.0-a77d20e5200c6faaac979e4b3aadc7b3dd7f8fec-integrity/node_modules/wildcard/", {"name":"wildcard","reference":"2.0.0"}],
  ["./", topLevelLocator],
]);
exports.findPackageLocator = function findPackageLocator(location) {
  let relativeLocation = normalizePath(path.relative(__dirname, location));

  if (!relativeLocation.match(isStrictRegExp))
    relativeLocation = `./${relativeLocation}`;

  if (location.match(isDirRegExp) && relativeLocation.charAt(relativeLocation.length - 1) !== '/')
    relativeLocation = `${relativeLocation}/`;

  let match;

  if (relativeLocation.length >= 198 && relativeLocation[197] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 198)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 188 && relativeLocation[187] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 188)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 186 && relativeLocation[185] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 186)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 180 && relativeLocation[179] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 180)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 176 && relativeLocation[175] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 176)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 174 && relativeLocation[173] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 174)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 172 && relativeLocation[171] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 172)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 170 && relativeLocation[169] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 170)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 169 && relativeLocation[168] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 169)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 166 && relativeLocation[165] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 166)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 165 && relativeLocation[164] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 165)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 164 && relativeLocation[163] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 164)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 163 && relativeLocation[162] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 163)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 162 && relativeLocation[161] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 162)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 160 && relativeLocation[159] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 160)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 159 && relativeLocation[158] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 159)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 157 && relativeLocation[156] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 157)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 156 && relativeLocation[155] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 156)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 155 && relativeLocation[154] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 155)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 154 && relativeLocation[153] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 154)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 153 && relativeLocation[152] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 153)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 151 && relativeLocation[150] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 151)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 149 && relativeLocation[148] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 149)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 148 && relativeLocation[147] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 148)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 147 && relativeLocation[146] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 147)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 145 && relativeLocation[144] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 145)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 144 && relativeLocation[143] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 144)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 143 && relativeLocation[142] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 143)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 142 && relativeLocation[141] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 142)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 141 && relativeLocation[140] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 141)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 140 && relativeLocation[139] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 140)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 139 && relativeLocation[138] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 139)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 138 && relativeLocation[137] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 138)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 137 && relativeLocation[136] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 137)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 136 && relativeLocation[135] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 136)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 135 && relativeLocation[134] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 135)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 133 && relativeLocation[132] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 133)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 132 && relativeLocation[131] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 132)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 131 && relativeLocation[130] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 131)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 129 && relativeLocation[128] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 129)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 128 && relativeLocation[127] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 128)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 127 && relativeLocation[126] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 127)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 124 && relativeLocation[123] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 124)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 123 && relativeLocation[122] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 123)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 2 && relativeLocation[1] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 2)))
      return blacklistCheck(match);

  return null;
};


/**
 * Returns the module that should be used to resolve require calls. It's usually the direct parent, except if we're
 * inside an eval expression.
 */

function getIssuerModule(parent) {
  let issuer = parent;

  while (issuer && (issuer.id === '[eval]' || issuer.id === '<repl>' || !issuer.filename)) {
    issuer = issuer.parent;
  }

  return issuer;
}

/**
 * Returns information about a package in a safe way (will throw if they cannot be retrieved)
 */

function getPackageInformationSafe(packageLocator) {
  const packageInformation = exports.getPackageInformation(packageLocator);

  if (!packageInformation) {
    throw makeError(
      `INTERNAL`,
      `Couldn't find a matching entry in the dependency tree for the specified parent (this is probably an internal error)`
    );
  }

  return packageInformation;
}

/**
 * Implements the node resolution for folder access and extension selection
 */

function applyNodeExtensionResolution(unqualifiedPath, {extensions}) {
  // We use this "infinite while" so that we can restart the process as long as we hit package folders
  while (true) {
    let stat;

    try {
      stat = statSync(unqualifiedPath);
    } catch (error) {}

    // If the file exists and is a file, we can stop right there

    if (stat && !stat.isDirectory()) {
      // If the very last component of the resolved path is a symlink to a file, we then resolve it to a file. We only
      // do this first the last component, and not the rest of the path! This allows us to support the case of bin
      // symlinks, where a symlink in "/xyz/pkg-name/.bin/bin-name" will point somewhere else (like "/xyz/pkg-name/index.js").
      // In such a case, we want relative requires to be resolved relative to "/xyz/pkg-name/" rather than "/xyz/pkg-name/.bin/".
      //
      // Also note that the reason we must use readlink on the last component (instead of realpath on the whole path)
      // is that we must preserve the other symlinks, in particular those used by pnp to deambiguate packages using
      // peer dependencies. For example, "/xyz/.pnp/local/pnp-01234569/.bin/bin-name" should see its relative requires
      // be resolved relative to "/xyz/.pnp/local/pnp-0123456789/" rather than "/xyz/pkg-with-peers/", because otherwise
      // we would lose the information that would tell us what are the dependencies of pkg-with-peers relative to its
      // ancestors.

      if (lstatSync(unqualifiedPath).isSymbolicLink()) {
        unqualifiedPath = path.normalize(path.resolve(path.dirname(unqualifiedPath), readlinkSync(unqualifiedPath)));
      }

      return unqualifiedPath;
    }

    // If the file is a directory, we must check if it contains a package.json with a "main" entry

    if (stat && stat.isDirectory()) {
      let pkgJson;

      try {
        pkgJson = JSON.parse(readFileSync(`${unqualifiedPath}/package.json`, 'utf-8'));
      } catch (error) {}

      let nextUnqualifiedPath;

      if (pkgJson && pkgJson.main) {
        nextUnqualifiedPath = path.resolve(unqualifiedPath, pkgJson.main);
      }

      // If the "main" field changed the path, we start again from this new location

      if (nextUnqualifiedPath && nextUnqualifiedPath !== unqualifiedPath) {
        const resolution = applyNodeExtensionResolution(nextUnqualifiedPath, {extensions});

        if (resolution !== null) {
          return resolution;
        }
      }
    }

    // Otherwise we check if we find a file that match one of the supported extensions

    const qualifiedPath = extensions
      .map(extension => {
        return `${unqualifiedPath}${extension}`;
      })
      .find(candidateFile => {
        return existsSync(candidateFile);
      });

    if (qualifiedPath) {
      return qualifiedPath;
    }

    // Otherwise, we check if the path is a folder - in such a case, we try to use its index

    if (stat && stat.isDirectory()) {
      const indexPath = extensions
        .map(extension => {
          return `${unqualifiedPath}/index${extension}`;
        })
        .find(candidateFile => {
          return existsSync(candidateFile);
        });

      if (indexPath) {
        return indexPath;
      }
    }

    // Otherwise there's nothing else we can do :(

    return null;
  }
}

/**
 * This function creates fake modules that can be used with the _resolveFilename function.
 * Ideally it would be nice to be able to avoid this, since it causes useless allocations
 * and cannot be cached efficiently (we recompute the nodeModulePaths every time).
 *
 * Fortunately, this should only affect the fallback, and there hopefully shouldn't be a
 * lot of them.
 */

function makeFakeModule(path) {
  const fakeModule = new Module(path, false);
  fakeModule.filename = path;
  fakeModule.paths = Module._nodeModulePaths(path);
  return fakeModule;
}

/**
 * Normalize path to posix format.
 */

function normalizePath(fsPath) {
  fsPath = path.normalize(fsPath);

  if (process.platform === 'win32') {
    fsPath = fsPath.replace(backwardSlashRegExp, '/');
  }

  return fsPath;
}

/**
 * Forward the resolution to the next resolver (usually the native one)
 */

function callNativeResolution(request, issuer) {
  if (issuer.endsWith('/')) {
    issuer += 'internal.js';
  }

  try {
    enableNativeHooks = false;

    // Since we would need to create a fake module anyway (to call _resolveLookupPath that
    // would give us the paths to give to _resolveFilename), we can as well not use
    // the {paths} option at all, since it internally makes _resolveFilename create another
    // fake module anyway.
    return Module._resolveFilename(request, makeFakeModule(issuer), false);
  } finally {
    enableNativeHooks = true;
  }
}

/**
 * This key indicates which version of the standard is implemented by this resolver. The `std` key is the
 * Plug'n'Play standard, and any other key are third-party extensions. Third-party extensions are not allowed
 * to override the standard, and can only offer new methods.
 *
 * If an new version of the Plug'n'Play standard is released and some extensions conflict with newly added
 * functions, they'll just have to fix the conflicts and bump their own version number.
 */

exports.VERSIONS = {std: 1};

/**
 * Useful when used together with getPackageInformation to fetch information about the top-level package.
 */

exports.topLevel = {name: null, reference: null};

/**
 * Gets the package information for a given locator. Returns null if they cannot be retrieved.
 */

exports.getPackageInformation = function getPackageInformation({name, reference}) {
  const packageInformationStore = packageInformationStores.get(name);

  if (!packageInformationStore) {
    return null;
  }

  const packageInformation = packageInformationStore.get(reference);

  if (!packageInformation) {
    return null;
  }

  return packageInformation;
};

/**
 * Transforms a request (what's typically passed as argument to the require function) into an unqualified path.
 * This path is called "unqualified" because it only changes the package name to the package location on the disk,
 * which means that the end result still cannot be directly accessed (for example, it doesn't try to resolve the
 * file extension, or to resolve directories to their "index.js" content). Use the "resolveUnqualified" function
 * to convert them to fully-qualified paths, or just use "resolveRequest" that do both operations in one go.
 *
 * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
 * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
 * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
 */

exports.resolveToUnqualified = function resolveToUnqualified(request, issuer, {considerBuiltins = true} = {}) {
  // The 'pnpapi' request is reserved and will always return the path to the PnP file, from everywhere

  if (request === `pnpapi`) {
    return pnpFile;
  }

  // Bailout if the request is a native module

  if (considerBuiltins && builtinModules.has(request)) {
    return null;
  }

  // We allow disabling the pnp resolution for some subpaths. This is because some projects, often legacy,
  // contain multiple levels of dependencies (ie. a yarn.lock inside a subfolder of a yarn.lock). This is
  // typically solved using workspaces, but not all of them have been converted already.

  if (ignorePattern && ignorePattern.test(normalizePath(issuer))) {
    const result = callNativeResolution(request, issuer);

    if (result === false) {
      throw makeError(
        `BUILTIN_NODE_RESOLUTION_FAIL`,
        `The builtin node resolution algorithm was unable to resolve the module referenced by "${request}" and requested from "${issuer}" (it didn't go through the pnp resolver because the issuer was explicitely ignored by the regexp "null")`,
        {
          request,
          issuer,
        }
      );
    }

    return result;
  }

  let unqualifiedPath;

  // If the request is a relative or absolute path, we just return it normalized

  const dependencyNameMatch = request.match(pathRegExp);

  if (!dependencyNameMatch) {
    if (path.isAbsolute(request)) {
      unqualifiedPath = path.normalize(request);
    } else if (issuer.match(isDirRegExp)) {
      unqualifiedPath = path.normalize(path.resolve(issuer, request));
    } else {
      unqualifiedPath = path.normalize(path.resolve(path.dirname(issuer), request));
    }
  }

  // Things are more hairy if it's a package require - we then need to figure out which package is needed, and in
  // particular the exact version for the given location on the dependency tree

  if (dependencyNameMatch) {
    const [, dependencyName, subPath] = dependencyNameMatch;

    const issuerLocator = exports.findPackageLocator(issuer);

    // If the issuer file doesn't seem to be owned by a package managed through pnp, then we resort to using the next
    // resolution algorithm in the chain, usually the native Node resolution one

    if (!issuerLocator) {
      const result = callNativeResolution(request, issuer);

      if (result === false) {
        throw makeError(
          `BUILTIN_NODE_RESOLUTION_FAIL`,
          `The builtin node resolution algorithm was unable to resolve the module referenced by "${request}" and requested from "${issuer}" (it didn't go through the pnp resolver because the issuer doesn't seem to be part of the Yarn-managed dependency tree)`,
          {
            request,
            issuer,
          }
        );
      }

      return result;
    }

    const issuerInformation = getPackageInformationSafe(issuerLocator);

    // We obtain the dependency reference in regard to the package that request it

    let dependencyReference = issuerInformation.packageDependencies.get(dependencyName);

    // If we can't find it, we check if we can potentially load it from the packages that have been defined as potential fallbacks.
    // It's a bit of a hack, but it improves compatibility with the existing Node ecosystem. Hopefully we should eventually be able
    // to kill this logic and become stricter once pnp gets enough traction and the affected packages fix themselves.

    if (issuerLocator !== topLevelLocator) {
      for (let t = 0, T = fallbackLocators.length; dependencyReference === undefined && t < T; ++t) {
        const fallbackInformation = getPackageInformationSafe(fallbackLocators[t]);
        dependencyReference = fallbackInformation.packageDependencies.get(dependencyName);
      }
    }

    // If we can't find the path, and if the package making the request is the top-level, we can offer nicer error messages

    if (!dependencyReference) {
      if (dependencyReference === null) {
        if (issuerLocator === topLevelLocator) {
          throw makeError(
            `MISSING_PEER_DEPENDENCY`,
            `You seem to be requiring a peer dependency ("${dependencyName}"), but it is not installed (which might be because you're the top-level package)`,
            {request, issuer, dependencyName}
          );
        } else {
          throw makeError(
            `MISSING_PEER_DEPENDENCY`,
            `Package "${issuerLocator.name}@${issuerLocator.reference}" is trying to access a peer dependency ("${dependencyName}") that should be provided by its direct ancestor but isn't`,
            {request, issuer, issuerLocator: Object.assign({}, issuerLocator), dependencyName}
          );
        }
      } else {
        if (issuerLocator === topLevelLocator) {
          throw makeError(
            `UNDECLARED_DEPENDENCY`,
            `You cannot require a package ("${dependencyName}") that is not declared in your dependencies (via "${issuer}")`,
            {request, issuer, dependencyName}
          );
        } else {
          const candidates = Array.from(issuerInformation.packageDependencies.keys());
          throw makeError(
            `UNDECLARED_DEPENDENCY`,
            `Package "${issuerLocator.name}@${issuerLocator.reference}" (via "${issuer}") is trying to require the package "${dependencyName}" (via "${request}") without it being listed in its dependencies (${candidates.join(
              `, `
            )})`,
            {request, issuer, issuerLocator: Object.assign({}, issuerLocator), dependencyName, candidates}
          );
        }
      }
    }

    // We need to check that the package exists on the filesystem, because it might not have been installed

    const dependencyLocator = {name: dependencyName, reference: dependencyReference};
    const dependencyInformation = exports.getPackageInformation(dependencyLocator);
    const dependencyLocation = path.resolve(__dirname, dependencyInformation.packageLocation);

    if (!dependencyLocation) {
      throw makeError(
        `MISSING_DEPENDENCY`,
        `Package "${dependencyLocator.name}@${dependencyLocator.reference}" is a valid dependency, but hasn't been installed and thus cannot be required (it might be caused if you install a partial tree, such as on production environments)`,
        {request, issuer, dependencyLocator: Object.assign({}, dependencyLocator)}
      );
    }

    // Now that we know which package we should resolve to, we only have to find out the file location

    if (subPath) {
      unqualifiedPath = path.resolve(dependencyLocation, subPath);
    } else {
      unqualifiedPath = dependencyLocation;
    }
  }

  return path.normalize(unqualifiedPath);
};

/**
 * Transforms an unqualified path into a qualified path by using the Node resolution algorithm (which automatically
 * appends ".js" / ".json", and transforms directory accesses into "index.js").
 */

exports.resolveUnqualified = function resolveUnqualified(
  unqualifiedPath,
  {extensions = Object.keys(Module._extensions)} = {}
) {
  const qualifiedPath = applyNodeExtensionResolution(unqualifiedPath, {extensions});

  if (qualifiedPath) {
    return path.normalize(qualifiedPath);
  } else {
    throw makeError(
      `QUALIFIED_PATH_RESOLUTION_FAILED`,
      `Couldn't find a suitable Node resolution for unqualified path "${unqualifiedPath}"`,
      {unqualifiedPath}
    );
  }
};

/**
 * Transforms a request into a fully qualified path.
 *
 * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
 * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
 * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
 */

exports.resolveRequest = function resolveRequest(request, issuer, {considerBuiltins, extensions} = {}) {
  let unqualifiedPath;

  try {
    unqualifiedPath = exports.resolveToUnqualified(request, issuer, {considerBuiltins});
  } catch (originalError) {
    // If we get a BUILTIN_NODE_RESOLUTION_FAIL error there, it means that we've had to use the builtin node
    // resolution, which usually shouldn't happen. It might be because the user is trying to require something
    // from a path loaded through a symlink (which is not possible, because we need something normalized to
    // figure out which package is making the require call), so we try to make the same request using a fully
    // resolved issuer and throws a better and more actionable error if it works.
    if (originalError.code === `BUILTIN_NODE_RESOLUTION_FAIL`) {
      let realIssuer;

      try {
        realIssuer = realpathSync(issuer);
      } catch (error) {}

      if (realIssuer) {
        if (issuer.endsWith(`/`)) {
          realIssuer = realIssuer.replace(/\/?$/, `/`);
        }

        try {
          exports.resolveToUnqualified(request, realIssuer, {considerBuiltins});
        } catch (error) {
          // If an error was thrown, the problem doesn't seem to come from a path not being normalized, so we
          // can just throw the original error which was legit.
          throw originalError;
        }

        // If we reach this stage, it means that resolveToUnqualified didn't fail when using the fully resolved
        // file path, which is very likely caused by a module being invoked through Node with a path not being
        // correctly normalized (ie you should use "node $(realpath script.js)" instead of "node script.js").
        throw makeError(
          `SYMLINKED_PATH_DETECTED`,
          `A pnp module ("${request}") has been required from what seems to be a symlinked path ("${issuer}"). This is not possible, you must ensure that your modules are invoked through their fully resolved path on the filesystem (in this case "${realIssuer}").`,
          {
            request,
            issuer,
            realIssuer,
          }
        );
      }
    }
    throw originalError;
  }

  if (unqualifiedPath === null) {
    return null;
  }

  try {
    return exports.resolveUnqualified(unqualifiedPath, {extensions});
  } catch (resolutionError) {
    if (resolutionError.code === 'QUALIFIED_PATH_RESOLUTION_FAILED') {
      Object.assign(resolutionError.data, {request, issuer});
    }
    throw resolutionError;
  }
};

/**
 * Setups the hook into the Node environment.
 *
 * From this point on, any call to `require()` will go through the "resolveRequest" function, and the result will
 * be used as path of the file to load.
 */

exports.setup = function setup() {
  // A small note: we don't replace the cache here (and instead use the native one). This is an effort to not
  // break code similar to "delete require.cache[require.resolve(FOO)]", where FOO is a package located outside
  // of the Yarn dependency tree. In this case, we defer the load to the native loader. If we were to replace the
  // cache by our own, the native loader would populate its own cache, which wouldn't be exposed anymore, so the
  // delete call would be broken.

  const originalModuleLoad = Module._load;

  Module._load = function(request, parent, isMain) {
    if (!enableNativeHooks) {
      return originalModuleLoad.call(Module, request, parent, isMain);
    }

    // Builtins are managed by the regular Node loader

    if (builtinModules.has(request)) {
      try {
        enableNativeHooks = false;
        return originalModuleLoad.call(Module, request, parent, isMain);
      } finally {
        enableNativeHooks = true;
      }
    }

    // The 'pnpapi' name is reserved to return the PnP api currently in use by the program

    if (request === `pnpapi`) {
      return pnpModule.exports;
    }

    // Request `Module._resolveFilename` (ie. `resolveRequest`) to tell us which file we should load

    const modulePath = Module._resolveFilename(request, parent, isMain);

    // Check if the module has already been created for the given file

    const cacheEntry = Module._cache[modulePath];

    if (cacheEntry) {
      return cacheEntry.exports;
    }

    // Create a new module and store it into the cache

    const module = new Module(modulePath, parent);
    Module._cache[modulePath] = module;

    // The main module is exposed as global variable

    if (isMain) {
      process.mainModule = module;
      module.id = '.';
    }

    // Try to load the module, and remove it from the cache if it fails

    let hasThrown = true;

    try {
      module.load(modulePath);
      hasThrown = false;
    } finally {
      if (hasThrown) {
        delete Module._cache[modulePath];
      }
    }

    // Some modules might have to be patched for compatibility purposes

    for (const [filter, patchFn] of patchedModules) {
      if (filter.test(request)) {
        module.exports = patchFn(exports.findPackageLocator(parent.filename), module.exports);
      }
    }

    return module.exports;
  };

  const originalModuleResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function(request, parent, isMain, options) {
    if (!enableNativeHooks) {
      return originalModuleResolveFilename.call(Module, request, parent, isMain, options);
    }

    let issuers;

    if (options) {
      const optionNames = new Set(Object.keys(options));
      optionNames.delete('paths');

      if (optionNames.size > 0) {
        throw makeError(
          `UNSUPPORTED`,
          `Some options passed to require() aren't supported by PnP yet (${Array.from(optionNames).join(', ')})`
        );
      }

      if (options.paths) {
        issuers = options.paths.map(entry => `${path.normalize(entry)}/`);
      }
    }

    if (!issuers) {
      const issuerModule = getIssuerModule(parent);
      const issuer = issuerModule ? issuerModule.filename : `${process.cwd()}/`;

      issuers = [issuer];
    }

    let firstError;

    for (const issuer of issuers) {
      let resolution;

      try {
        resolution = exports.resolveRequest(request, issuer);
      } catch (error) {
        firstError = firstError || error;
        continue;
      }

      return resolution !== null ? resolution : request;
    }

    throw firstError;
  };

  const originalFindPath = Module._findPath;

  Module._findPath = function(request, paths, isMain) {
    if (!enableNativeHooks) {
      return originalFindPath.call(Module, request, paths, isMain);
    }

    for (const path of paths || []) {
      let resolution;

      try {
        resolution = exports.resolveRequest(request, path);
      } catch (error) {
        continue;
      }

      if (resolution) {
        return resolution;
      }
    }

    return false;
  };

  process.versions.pnp = String(exports.VERSIONS.std);
};

exports.setupCompatibilityLayer = () => {
  // ESLint currently doesn't have any portable way for shared configs to specify their own
  // plugins that should be used (https://github.com/eslint/eslint/issues/10125). This will
  // likely get fixed at some point, but it'll take time and in the meantime we'll just add
  // additional fallback entries for common shared configs.

  for (const name of [`react-scripts`]) {
    const packageInformationStore = packageInformationStores.get(name);
    if (packageInformationStore) {
      for (const reference of packageInformationStore.keys()) {
        fallbackLocators.push({name, reference});
      }
    }
  }

  // Modern versions of `resolve` support a specific entry point that custom resolvers can use
  // to inject a specific resolution logic without having to patch the whole package.
  //
  // Cf: https://github.com/browserify/resolve/pull/174

  patchedModules.push([
    /^\.\/normalize-options\.js$/,
    (issuer, normalizeOptions) => {
      if (!issuer || issuer.name !== 'resolve') {
        return normalizeOptions;
      }

      return (request, opts) => {
        opts = opts || {};

        if (opts.forceNodeResolution) {
          return opts;
        }

        opts.preserveSymlinks = true;
        opts.paths = function(request, basedir, getNodeModulesDir, opts) {
          // Extract the name of the package being requested (1=full name, 2=scope name, 3=local name)
          const parts = request.match(/^((?:(@[^\/]+)\/)?([^\/]+))/);

          // make sure that basedir ends with a slash
          if (basedir.charAt(basedir.length - 1) !== '/') {
            basedir = path.join(basedir, '/');
          }
          // This is guaranteed to return the path to the "package.json" file from the given package
          const manifestPath = exports.resolveToUnqualified(`${parts[1]}/package.json`, basedir);

          // The first dirname strips the package.json, the second strips the local named folder
          let nodeModules = path.dirname(path.dirname(manifestPath));

          // Strips the scope named folder if needed
          if (parts[2]) {
            nodeModules = path.dirname(nodeModules);
          }

          return [nodeModules];
        };

        return opts;
      };
    },
  ]);
};

if (module.parent && module.parent.id === 'internal/preload') {
  exports.setupCompatibilityLayer();

  exports.setup();
}

if (process.mainModule === module) {
  exports.setupCompatibilityLayer();

  const reportError = (code, message, data) => {
    process.stdout.write(`${JSON.stringify([{code, message, data}, null])}\n`);
  };

  const reportSuccess = resolution => {
    process.stdout.write(`${JSON.stringify([null, resolution])}\n`);
  };

  const processResolution = (request, issuer) => {
    try {
      reportSuccess(exports.resolveRequest(request, issuer));
    } catch (error) {
      reportError(error.code, error.message, error.data);
    }
  };

  const processRequest = data => {
    try {
      const [request, issuer] = JSON.parse(data);
      processResolution(request, issuer);
    } catch (error) {
      reportError(`INVALID_JSON`, error.message, error.data);
    }
  };

  if (process.argv.length > 2) {
    if (process.argv.length !== 4) {
      process.stderr.write(`Usage: ${process.argv[0]} ${process.argv[1]} <request> <issuer>\n`);
      process.exitCode = 64; /* EX_USAGE */
    } else {
      processResolution(process.argv[2], process.argv[3]);
    }
  } else {
    let buffer = '';
    const decoder = new StringDecoder.StringDecoder();

    process.stdin.on('data', chunk => {
      buffer += decoder.write(chunk);

      do {
        const index = buffer.indexOf('\n');
        if (index === -1) {
          break;
        }

        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);

        processRequest(line);
      } while (true);
    });
  }
}
