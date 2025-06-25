/**
 * @name utf8-sanitize
 * @description Sanitizes and repairs UTF-8 text
 * 
 * @version 1.0.1
 * @author charuse
 * @license MIT
 * 
 * @repository https://github.com/charuse/utf8-sanitize.git
 * 
 * Function definitions and usage examples in USAGE_EX.MD
 */

// Constants
const mp = require('./1252.js');
const MAX_SAFE_CHAR_LIMIT = (2 ** 28) - 56;
const SB = '';

const rv = Object.entries(mp).reduce((o,[b,ch])=>{
  o[ch]=+b; return o;
},{});

// Repairs mojibake corruption in latin1 single-byte to multi-byte UTF-8 character conversion
function FixLatin1Corrupt(input) { // => string
  if (typeof input!=='string' || !input.length) return input;

  input = input.replace('â€�', '”');
  const bs = [];
  for (const ch of input) {
    if (rv[ch]!=null) {
      bs.push(rv[ch]);
    } else {
      const c = ch.charCodeAt(0);
      bs.push(c < 256 ? c : 63); 
    }
  }
  let out = SB, i = 0;
  let bl = bs.length;
  while (i < bl) {
  const b1 = bs[i++];

  if (b1 < 0x80) {
      out += String.fromCharCode(b1);
    } else if (b1 >= 0xC2 && b1 <= 0xDF) {
      if (i < bl && (bs[i] & 0xC0) === 0x80) {
        const b2 = bs[i++];
        out += String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
      } else {
        out += '\uFFFD';
      }
    } else if (b1 >= 0xE0 && b1 <= 0xEF) {
      if (
        i + 1 < bl &&
        (bs[i] & 0xC0) === 0x80 &&
        (bs[i + 1] & 0xC0) === 0x80
      ) {
        const b2 = bs[i++];
        const b3 = bs[i++];
        out += String.fromCharCode(
          ((b1 & 0x0F) << 12) |
          ((b2 & 0x3F) << 6) |
          (b3 & 0x3F)
        );
      } else {
        out += '\uFFFD';
        i += 2;
      }
    } else if (b1 >= 0x80 && b1 <= 0x9F) {
      out += mp[b1] || '\uFFFD';
    } else {
      out += String.fromCharCode(b1);
    }
  }
  return out;
}

// Check if a string size matches its expected or safe size
function VerifyByteLength(input) { // => boolean
  if (typeof input !== 'string') { return false; }
  const il = input.length;
  return ((il <= MAX_SAFE_CHAR_LIMIT) && (input.split(SB).length === il));
}

// Cleans string by removing or escaping characters based on a sanitization mode specified in options (alphanumeric, html, filename)
function SanitizeInput(input, options) { // => string
  if (typeof input !== 'string' || input.length === 0) {
    return SB;
  }

  const icr = /[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g;
  const pci = input.replace(icr, SB);

  const opts = options || {};
  const mds = ['alphanumeric', 'html', 'filename'];
  const md = mds.includes(opts.mode) ? opts.mode : 'alphanumeric';
  const ks = opts.keepSpaces !== false;

  switch (md) {
    case 'alphanumeric': {
      const rgx = ks ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
      return pci.replace(rgx, SB);
    }
    case 'html': {
      const map = {'&': '&', '<': '<', '>': '>', '"': '"', "'": "'"};
      return pci.replace(/[&<>"']/g, (m) => map[m]);
    }
    case 'filename': {
      return pci.replace(/[\\/?%*:|"<>\x00-\x1F\x7F]/g, SB);
    }
  }
  return SB;
}

// Full pipeline for byte length validation, latin1 encoding repair, and string sanitization
function FullSanitize(input, options) { // => string
  if (!VerifyByteLength(input)) {
    return SB;
  }
  const d1 = FixLatin1Corrupt(input);
  const d2 = SanitizeInput(d1, options);
  return d2;
}

module.exports = {
  FixLatin1Corrupt,
  SanitizeInput,
  VerifyByteLength,
  FullSanitize,
  MAX_SAFE_CHAR_LIMIT,
};