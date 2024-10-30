import formats from "./formats/index.ts";
import type { Ajv } from "ajv";

export default (ajv: Ajv, options = {}) => {
  const allFormats = Object.keys(formats);
  let formatsToInstall = allFormats;

  if (options.formats) {
    if (!Array.isArray(options.formats))
      throw new Error('options.formats must be an array');
    formatsToInstall = options.formats;
  }

  allFormats
    .filter((format) => formatsToInstall.includes(format))
    .forEach((key) => {
      ajv.addFormat(key, formats[key]);
    });

  return ajv;
};
