import uri, { type URIComponents } from "uri-js-replace";
import smtpAddress from "smtp-address-parser";
import schemes from "@silverbucket/iana-schemes";
import type { LocalURIComponents } from "./iri-reference.ts";

function validate(address: string): boolean {
  try {
    smtpAddress.parse(address);
    return true;
  } catch (_) {
    return false;
  }
}

function every(obj: URIComponents) {
  for (const prop in obj) {
    if (!validate(obj[prop as keyof URIComponents] as string)) {
      return false;
    }
  }
}

export default (value: string) => {
  const iri = uri.parse(value) as LocalURIComponents;
  if (iri.scheme === "mailto" && every(iri)) {
    return true;
  }
  return !!(
    (iri.reference === "absolute" || iri.reference === "uri") &&
    schemes.allByName[iri.scheme]
  );
};
