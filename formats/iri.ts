import uri from 'uri-js';
import smtpAddress from 'smtp-address-parser';
import schemes from 'schemes';

function validate(address: string) {
  try {
    smtpAddress.parse(address);
    return true;
  } catch (_) {
    return false;
  }
}

export default (value: string) => {
  const iri = uri.parse(value);
  if (iri.scheme === 'mailto' && iri.to.every(validate)) {
    return true;
  }
  return !!(
    (iri.reference === 'absolute' || iri.reference === 'uri') &&
    schemes.allByName[iri.scheme]
  );
};
