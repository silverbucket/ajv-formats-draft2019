import formats, { type Ajv2019Formats } from "./formats/index.ts";
import type { Ajv } from "ajv";

type Options = {
  formats?: string[];
};

export default (ajv: Ajv, options: Options = {}): Ajv => {
  const allFormats = Object.keys(formats);
  let formatsToInstall = allFormats;

  if (options.formats) {
    if (!Array.isArray(options.formats)) {
      throw new Error("options.formats must be an array");
    }
    formatsToInstall = options.formats;
  }

  allFormats
    .filter((format) => formatsToInstall.includes(format))
    .forEach((key) => {
      ajv.addFormat(key, formats[key as keyof Ajv2019Formats]);
    });

  return ajv;
};
