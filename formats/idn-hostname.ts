import { toASCII } from "punycode-esm";

const hostnameRegex =
  /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;

export default (value: string) => {
  const hostname = toASCII(value);
  return (
    hostname.replace(/\.$/, "").length <= 253 && hostnameRegex.test(hostname)
  );
};
