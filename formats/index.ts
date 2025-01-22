import iri from "./iri.ts";
import duration from "./duration.ts";
import idnEmail from "./idn-email.ts";
import idnHostname from "./idn-hostname.ts";
import iriReference from "./iri-reference.ts";
import type { Format } from "ajv";

export type Ajv2019Formats = {
  [keys: string]: Format;
};

const formats: Ajv2019Formats = {
  iri: iri,
  duration: duration,
  "idn-email": idnEmail,
  "idn-hostname": idnHostname,
  "iri-reference": iriReference,
};

export default formats;
