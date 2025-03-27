import { describe, expect, it } from "bun:test";
import formats from "./formats/index.ts";
import idn from "./idn.ts";
import { Ajv } from "ajv";

import apply from "./index.ts";

it("add the types to ajv with the apply function", function () {
  const ajv = new Ajv();
  apply(ajv);
  expect(ajv.formats.duration).toBeTruthy();
  expect(ajv.formats.iri).toBeTruthy();
  expect(ajv.formats["idn-email"]).toBeTruthy();
  expect(ajv.formats["idn-hostname"]).toBeTruthy();
  expect(ajv.formats["iri-reference"]).toBeTruthy();
});

it("add the types to ajv as options to Ajv instances", function () {
  const ajv = new Ajv({ formats });
  expect(ajv.formats.duration).toBeTruthy();
  expect(ajv.formats.iri).toBeTruthy();
  expect(ajv.formats["idn-email"]).toBeTruthy();
  expect(ajv.formats["idn-hostname"]).toBeTruthy();
  expect(ajv.formats["iri-reference"]).toBeTruthy();
});

it("accept valid IRIs", function () {
  const ajv = new Ajv();
  apply(ajv);
  const schema = {
    type: "string",
    format: "iri",
  };
  const validate = ajv.compile(schema);

  // examples from https://tools.ietf.org/html/rfc2396#section-1.3
  expect(validate("http://www.ietf.org/rfc/rfc2396.txt")).toBeTruthy();
  expect(validate("https://пошта.укр/russian")).toBeTruthy();
  expect(validate("ldap://[2001:db8::7]/c=GB?objectClass?one")).toBeTruthy();
  expect(validate("mailto:John.Doe@example.com")).toBeTruthy();
  expect(validate("news:comp.infosystems.www.servers.unix")).toBeTruthy();;
  expect(validate("tel:+1-816-555-1212")).toBeTruthy();
  expect(validate("telnet://192.0.2.16:80/")).toBeTruthy();
  expect(validate("urn:oasis:names:specification:docbook:dtd:xml:4.1.2")).toBeTruthy();

  // https://github.com/luzlab/ajv-formats-draft2019/issues/11
  expect(validate("modbus+tcp://1.2.3.4/path")).toBeTruthy();
  expect(validate("mqtt://1.2.3.4/path")).toBeTruthy();

  // https://github.com/luzlab/ajv-formats-draft2019/issues/16
  expect(validate("http://www.w3.org/2004/02/skos/core#Concept")).toBeTruthy();
});

it("reject invalid IRIs", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "iri",
  };
  const validate = ajv.compile(schema);
  expect(!validate("example.com")).toBeTruthy(); // missing a scheme
  expect(!validate("invalidScheme://example.com")).toBeTruthy(); // an invalid scheme
  expect(!validate("this:that")).toBeTruthy();

  // These are IRI-References not IRI
  expect(!validate("#someelement")).toBeTruthy();
  expect(!validate("afile.svg#anelement")).toBeTruthy();
});

it("accept a valid duration", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "duration",
  };
  const validate = ajv.compile(schema);
  expect(validate("P1Y2M4DT20H44M12.67S")).toBeTruthy();
});

it("reject an invalid duration", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "duration",
  };
  const validate = ajv.compile(schema);
  expect(!validate("10 seconds")).toBeTruthy();
});

it("accept valid idn-emails", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "idn-email",
  };
  const validate = ajv.compile(schema);

  // examples from https://en.wikipedia.org/wiki/International_email
  expect(validate("квіточка@пошта.укр")).toBeTruthy();
  expect(validate("Dörte@Sörensen.example.com")).toBeTruthy();
  expect(validate("John.Doe@example.com")).toBeTruthy();
  expect(validate('"John Doe"@example.com')).toBeTruthy();
});

it("reject invalid idn-emails", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "idn-email",
  };
  const validate = ajv.compile(schema);
  expect(!validate("johndoe")).toBeTruthy();
  expect(!validate("valid@somewhere.com?asdf")).toBeTruthy();
});

it("accept valid international domains", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "idn-hostname",
  };
  const validate = ajv.compile(schema);

  expect(validate("google.com")).toBeTruthy();
  expect(validate("123.example.com.")).toBeTruthy();

  // example from https://en.wikipedia.org/wiki/Internationalized_domain_name#Example_of_IDNA_encoding
  expect(validate("ジェーピーニック.jp")).toBeTruthy();
  expect(validate("ουτοπία.δπθ.gr")).toBeTruthy();

  // https://tools.ietf.org/html/rfc5890#section-2.3.2.3
  // -- An "internationalized domain name" (IDN) is a domain name that contains
  //    at least ONE A-label or U-label
  expect(validate("localhost")).toBeTruthy();

  // from AJV test suite
  // valid hostname - maximum length hostname (255 octets) with trailing dot
  expect(
    validate(
      "abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxy.example.com.",
    ),
  ).toBeTruthy();
  // valid hostname - maximum length hostname (255 octets)
  expect(
    validate(
      "abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxy.example.com",
    ),
  ).toBeTruthy();
  // valid hostname - maximum length label (63 chars)
  expect(
    validate(
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.example.com",
    ),
  ).toBeTruthy();

  // example from https://unicode.org/faq/idn.html#11
  expect(validate("öbb.at")).toBeTruthy();
});

it("reject invalid international domains", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "idn-hostname",
  };
  const validate = ajv.compile(schema);

  // bad tld

  // from ajv test suite
  // invalid hostname - label too long (64 chars)
  expect(
    !validate(
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl.example.com",
    ),
  ).toBeTruthy();
  // invalid hostname - hostname too long (256 octets)
  expect(
    !validate(
      "abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.example.com",
    ),
  ).toBeTruthy();
  // invalid hostname - hostname too long (256 octets)
  expect(
    !validate(
      "abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.example.com.",
    ),
  ).toBeTruthy();

  // a URL, not a hostname
  expect(!validate("http://google.com")).toBeTruthy();
});

it("accept valid IRI-reference", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "iri-reference",
  };
  const validate = ajv.compile(schema);

  expect(validate("https://tools.ietf.org/html/rfc3986#section-4.2")).toBeTruthy();

  // examples from https://dev.w3.org/SVG/profiles/1.2T/publish/diff/linking.html#IRIforms
  expect(validate("#someelement")).toBeTruthy();
  expect(validate("afile.svg#anelement")).toBeTruthy();
  expect(validate("afile.svg")).toBeTruthy();
  expect(validate("somecontainer#fragment")).toBeTruthy();

  // from http://homepage.divms.uiowa.edu/~rus/Courses/WebPro/uri.pdf
  expect(
    validate(
      "http://example.org/absolute/URI/with/absolute/path/to/resource.txt",
    ),
  ).toBeTruthy();
  expect(
    validate(
      "//example.org/scheme-relative/URI/with/absolute/path/to/resource.txt",
    ),
  ).toBeTruthy();
  expect(validate("/relative/URI/with/absolute/path/to/resource.txt")).toBeTruthy();
  expect(validate("relative/path/to/resource.txt")).toBeTruthy();
  expect(validate("../../../resource.txt")).toBeTruthy();
  expect(validate("./resource.txt#frag01")).toBeTruthy();
  expect(validate("resource.txt")).toBeTruthy();
  expect(validate("#frag01")).toBeTruthy();

  // https://tools.ietf.org/html/rfc3986#section-4.2
  expect(validate("//network/test")).toBeTruthy();
  expect(validate("./this:that")).toBeTruthy();
  expect(validate("./path")).toBeTruthy(); // relative-path reference
  expect(validate("/path")).toBeTruthy(); // absolute-path reference

  // https://github.com/luzlab/ajv-formats-draft2019/issues/9
  expect(validate("valid@email.format")).toBeTruthy();
});

it("reject invalid IRI-reference", function () {
  const ajv = new Ajv();
  apply(ajv);

  const schema = {
    type: "string",
    format: "iri-reference",
  };
  const validate = ajv.compile(schema);

  // https://tools.ietf.org/html/rfc3986#section-4.2
  expect(!validate("this:that")).toBeTruthy();

  // https://github.com/luzlab/ajv-formats-draft2019/issues/9
  // FIXME
  //expect(!validate("mailto:invalid.format"));
});

it("draft07 should include the correct formats", function () {
  expect(idn["idn-hostname"]).toBeTruthy();
  expect(idn["idn-email"]).toBeTruthy();
  expect(idn["iri"]).toBeTruthy();
  expect(idn["iri-reference"]).toBeTruthy();
});

it("add the idn types to ajv as options to Ajv instances", function () {
  const ajv = new Ajv({ formats: idn });
  expect(!ajv.formats.duration).toBeTruthy();
  expect(ajv.formats.iri).toBeTruthy();
  expect(ajv.formats["idn-email"]).toBeTruthy();
  expect(ajv.formats["idn-hostname"]).toBeTruthy();
  expect(ajv.formats["iri-reference"]).toBeTruthy();
});

it("it should be possible to cherry pick formats to install", function () {
  const ajv = new Ajv({
    formats: {
      duration: formats.duration,
      iri: formats.iri,
    },
  });

  expect(ajv.formats.duration).toBeTruthy();
  expect(ajv.formats.iri).toBeTruthy();
  expect(!ajv.formats["idn-email"]).toBeTruthy();
  expect(!ajv.formats["idn-hostname"]).toBeTruthy();
  expect(!ajv.formats["iri-reference"]).toBeTruthy();
});

it("it should be possible to specify formats to install", function () {
  const ajv = new Ajv();
  apply(ajv, { formats: ["idn-email", "iri"] });
  expect(!ajv.formats.duration).toBeTruthy();
  expect(ajv.formats.iri).toBeTruthy();
  expect(ajv.formats["idn-email"]).toBeTruthy();
  expect(!ajv.formats["idn-hostname"]).toBeTruthy();
  expect(!ajv.formats["iri-reference"]).toBeTruthy();
});
