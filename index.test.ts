import 'https://deno.land/x/deno_mocha/global.ts';
import formats from './formats/index.ts';
import idn from './idn.ts';
import * as chai from 'npm:chai';
import { Ajv, type Format } from 'npm:ajv';

import apply from './index.ts';

const assert = chai.assert;

describe('load types', function () {
  it('add the types to ajv with the apply function', function () {
    const ajv = new Ajv();
    apply(ajv);
    assert.ok(ajv.formats.duration);
    assert.ok(ajv.formats.iri);
    assert.ok(ajv.formats['idn-email']);
    assert.ok(ajv.formats['idn-hostname']);
    assert.ok(ajv.formats['iri-reference']);
  });

  it('add the types to ajv as options to Ajv instances', function () {
    const ajv = new Ajv({ formats });
    assert.ok(ajv.formats.duration);
    assert.ok(ajv.formats.iri);
    assert.ok(ajv.formats['idn-email']);
    assert.ok(ajv.formats['idn-hostname']);
    assert.ok(ajv.formats['iri-reference']);
  });

  it('accept valid IRIs', function () {
    const ajv = new Ajv();
    apply(ajv);
    const schema = {
      type: 'string',
      format: 'iri',
    };
    const validate = ajv.compile(schema);

    // examples from https://tools.ietf.org/html/rfc2396#section-1.3
    assert.ok(validate('http://www.ietf.org/rfc/rfc2396.txt'));
    assert.ok(validate('https://пошта.укр/russian'));
    assert.ok(validate('ldap://[2001:db8::7]/c=GB?objectClass?one'));
    assert.ok(validate('mailto:John.Doe@example.com'));
    assert.ok(validate('news:comp.infosystems.www.servers.unix'));
    assert.ok(validate('tel:+1-816-555-1212'));
    assert.ok(validate('telnet://192.0.2.16:80/'));
    assert.ok(validate('urn:oasis:names:specification:docbook:dtd:xml:4.1.2'));

    // https://github.com/luzlab/ajv-formats-draft2019/issues/11
    assert.ok(validate('modbus+tcp://1.2.3.4/path'));
    assert.ok(validate('mqtt://1.2.3.4/path'));

    // https://github.com/luzlab/ajv-formats-draft2019/issues/16
    assert.ok(validate('http://www.w3.org/2004/02/skos/core#Concept'));
  });

  it('reject invalid IRIs', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'iri',
    };
    const validate = ajv.compile(schema);
    assert.ok(!validate('example.com')); // missing a scheme
    assert.ok(!validate('invalidScheme://example.com')); // an invalid scheme
    assert.ok(!validate('this:that'));

    // These are IRI-References not IRI
    assert.ok(!validate('#someelement'));
    assert.ok(!validate('afile.svg#anelement'));
  });

  it('accept a valid duration', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'duration',
    };
    const validate = ajv.compile(schema);
    assert.ok(validate('P1Y2M4DT20H44M12.67S'));
  });

  it('reject an invalid duration', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'duration',
    };
    const validate = ajv.compile(schema);
    assert.ok(!validate('10 seconds'));
  });

  it('accept valid idn-emails', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'idn-email',
    };
    const validate = ajv.compile(schema);

    // examples from https://en.wikipedia.org/wiki/International_email
    assert.ok(validate('квіточка@пошта.укр'));
    assert.ok(validate('Dörte@Sörensen.example.com'));
    assert.ok(validate('John.Doe@example.com'));
    assert.ok(validate('"John Doe"@example.com'));
  });

  it('reject invalid idn-emails', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'idn-email',
    };
    const validate = ajv.compile(schema);
    assert.ok(!validate('johndoe'));
    assert.ok(!validate('valid@somewhere.com?asdf'));
  });

  it('accept valid international domains', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'idn-hostname',
    };
    const validate = ajv.compile(schema);

    assert.ok(validate('google.com'));
    assert.ok(validate('123.example.com.'));

    // example from https://en.wikipedia.org/wiki/Internationalized_domain_name#Example_of_IDNA_encoding
    assert.ok(validate('ジェーピーニック.jp'));
    assert.ok(validate('ουτοπία.δπθ.gr'));

    // https://tools.ietf.org/html/rfc5890#section-2.3.2.3
    // -- An "internationalized domain name" (IDN) is a domain name that contains
    //    at least ONE A-label or U-label
    assert.ok(validate('localhost'));

    // from AJV test suite
    // valid hostname - maximum length hostname (255 octets) with trailing dot
    assert.ok(
      validate(
        'abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxy.example.com.',
      ),
    );
    // valid hostname - maximum length hostname (255 octets)
    assert.ok(
      validate(
        'abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxy.example.com',
      ),
    );
    // valid hostname - maximum length label (63 chars)
    assert.ok(
      validate(
        'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.example.com',
      ),
    );

    // example from https://unicode.org/faq/idn.html#11
    assert.ok(validate('öbb.at'));
  });

  it('reject invalid international domains', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'idn-hostname',
    };
    const validate = ajv.compile(schema);

    // bad tld

    // from ajv test suite
    // invalid hostname - label too long (64 chars)
    assert.ok(
      !validate(
        'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl.example.com',
      ),
    );
    // invalid hostname - hostname too long (256 octets)
    assert.ok(
      !validate(
        'abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.example.com',
      ),
    );
    // invalid hostname - hostname too long (256 octets)
    assert.ok(
      !validate(
        'abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.example.com.',
      ),
    );

    // a URL, not a hostname
    assert.ok(!validate('http://google.com'));
  });

  it('accept valid IRI-reference', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'iri-reference',
    };
    const validate = ajv.compile(schema);

    assert.ok(validate('https://tools.ietf.org/html/rfc3986#section-4.2'));

    // examples from https://dev.w3.org/SVG/profiles/1.2T/publish/diff/linking.html#IRIforms
    assert.ok(validate('#someelement'));
    assert.ok(validate('afile.svg#anelement'));
    assert.ok(validate('afile.svg'));
    assert.ok(validate('somecontainer#fragment'));

    // from http://homepage.divms.uiowa.edu/~rus/Courses/WebPro/uri.pdf
    assert.ok(
      validate(
        'http://example.org/absolute/URI/with/absolute/path/to/resource.txt',
      ),
    );
    assert.ok(
      validate(
        '//example.org/scheme-relative/URI/with/absolute/path/to/resource.txt',
      ),
    );
    assert.ok(validate('/relative/URI/with/absolute/path/to/resource.txt'));
    assert.ok(validate('relative/path/to/resource.txt'));
    assert.ok(validate('../../../resource.txt'));
    assert.ok(validate('./resource.txt#frag01'));
    assert.ok(validate('resource.txt'));
    assert.ok(validate('#frag01'));

    // https://tools.ietf.org/html/rfc3986#section-4.2
    assert.ok(validate('//network/test'));
    assert.ok(validate('./this:that'));
    assert.ok(validate('./path')); // relative-path reference
    assert.ok(validate('/path')); // absolute-path reference

    // https://github.com/luzlab/ajv-formats-draft2019/issues/9
    assert.ok(validate('mailto:valid@email.format'));
  });

  it('reject invalid IRI-reference', function () {
    const ajv = new Ajv();
    apply(ajv);

    const schema = {
      type: 'string',
      format: 'iri-reference',
    };
    const validate = ajv.compile(schema);

    // https://tools.ietf.org/html/rfc3986#section-4.2
    assert.ok(!validate('this:that'));

    // https://github.com/luzlab/ajv-formats-draft2019/issues/9
    assert.ok(!validate('mailto:invalid.format'));
  });

  it('idn should not include the duration format', function () {
    assert.ok(!formats.duration);
  });

  it('draft07 should include the correct formats', function () {
    assert.ok(idn['idn-hostname']);
    assert.ok(idn['idn-email']);
    assert.ok(idn['iri']);
    assert.ok(idn['iri-reference']);
  });

  it('add the idn types to ajv as options to Ajv instances', function () {
    const ajv = new Ajv({ formats: idn });
    assert.ok(!ajv.formats.duration);
    assert.ok(ajv.formats.iri);
    assert.ok(ajv.formats['idn-email']);
    assert.ok(ajv.formats['idn-hostname']);
    assert.ok(ajv.formats['iri-reference']);
  });

  it('it should be possible to cherry pick formats to install', function () {
    const ajv = new Ajv({
      formats: {
        duration: formats.duration,
        iri: formats.iri
      }
    });

    assert.ok(ajv.formats.duration);
    assert.ok(ajv.formats.iri);
    assert.ok(!ajv.formats['idn-email']);
    assert.ok(!ajv.formats['idn-hostname']);
    assert.ok(!ajv.formats['iri-reference']);
  });

  it('it should be possible to specify formats to install', function () {
    const ajv = new Ajv();
    apply(ajv, { formats: ['idn-email', 'iri'] });
    assert.ok(!ajv.formats.duration);
    assert.ok(ajv.formats.iri);
    assert.ok(ajv.formats['idn-email']);
    assert.ok(!ajv.formats['idn-hostname']);
    assert.ok(!ajv.formats['iri-reference']);
  });
});
