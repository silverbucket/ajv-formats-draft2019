import { parse } from "smtp-address-parser";

export default (value: string) => {
  try {
    parse(value);
    return true;
  } catch (_) {
    return false;
  }
};
