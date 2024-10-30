import { parse } from 'uri-js';
import {parse as addressParser} from 'smtp-address-parser';
import schemes from 'schemes';

function validate(address: string) {
  try {
    addressParser(address);
    return true;
  } catch (_) {
    return false;
  }
}

export default (value: string) => {
  const iri = parse(value);
  if (iri.scheme === 'mailto' && iri.to.every(validate)) {
    return true;
  }
  if ((iri.reference === 'absolute' || iri.reference === 'uri') && schemes.allByName[iri.scheme]) {
    return true;
  }
  return false;
};
