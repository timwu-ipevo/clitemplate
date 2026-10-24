// Process entry point shared by every way of running the CLI:
// `node src/run.ts` (dev), bin/clitemplate.js (npm), and the standalone
// executable built by scripts/build-exe.mjs. Avoid top-level await here:
// the executable bundle is CommonJS.
import { main } from './cli.ts';

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  },
);
