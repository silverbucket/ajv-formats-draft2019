import { parse, type URIComponents } from "uri-js-replace";
import { parse as addressParser } from "smtp-address-parser";
import schemes from "@silverbucket/iana-schemes";

export interface LocalURIComponents extends URIComponents {
  scheme: string;
  reference: string;
  path: string;
}

function validate(address: string): boolean {
  try {
    addressParser(address);
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
  const iri = parse(value) as LocalURIComponents;
  // All valid IRIs are valid IRI-references
  if (iri.scheme === "mailto" && every(iri)) {
    return true;
  }

  // Check for valid IRI-reference
  if (
    iri.reference === "absolute" &&
    iri.path !== undefined &&
    schemes.allByName[iri.scheme]
  ) {
    return true;
  }

  // Check for valid IRI-reference

  // If there is a scheme, it must be valid
  if (iri.scheme && !schemes.allByName[iri.scheme]) {
    return false;
  }

  // Check there's a path and for a proper type of reference
  return (
    iri.path !== undefined &&
    (iri.reference === "relative" ||
      iri.reference === "same-document" ||
      iri.reference === "uri")
  );
};
