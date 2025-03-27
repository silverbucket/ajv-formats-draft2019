import { Glob } from "bun";

const sourceDirectory = "./src/";
const glob = new Glob('*.ts');
var entrypoints = [...glob.scanSync(sourceDirectory)];
entrypoints = entrypoints.map((x) => sourceDirectory + x);

const results = await Bun.build({
  target: 'bun',
  entrypoints: entrypoints,
  outdir: './dist',
  sourcemap: "inline",
  minify: true,
});
