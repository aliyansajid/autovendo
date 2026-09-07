import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

export { default } from "@repo/ui/postcss.config";
