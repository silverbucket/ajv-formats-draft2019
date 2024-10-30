import iri from './formats/iri.ts';
import idnEmail from './formats/idn-email.ts';
import idnHostname from "./formats/idn-hostname.ts";
import iriReference from "./formats/iri-reference.ts";

export const exports = {
    iri: iri,
    'idn-email': idnEmail,
    'idn-hostname': idnHostname,
    'iri-reference': iriReference,
};
