import { build, emptyDir } from "@deno/dnt";
import deno from "../deno.json" with { type: "json" };

await emptyDir("./npm");

await build({
  typeCheck: "both",
  entryPoints: ["./index.ts"],
  outDir: "./npm",
  shims: {
    deno: "dev",
    timers: true
  },
  package: {
    // package.json properties
    name: deno.name,
    version: deno.version,
    description: deno.description,
    license: deno.license,
    repository: {
      type: "git",
      url: "git+https://github.com/silverbucket/ajv-formats-draft2019.git",
    },
    bugs: {
      url: "https://github.com/silverbucket/ajv-formats-draft2019/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
