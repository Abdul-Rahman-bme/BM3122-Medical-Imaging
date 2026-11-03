import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';
export default defineConfig({test:{include:['tests/unit/**/*.test.ts'],environment:'node',pool:'forks',maxWorkers:1},resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}}});
