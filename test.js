// test.js
const mp = require('./1252.js');
let x = 0;

const rv = Object.entries(mp).reduce((o,[b,ch])=>{
  o[ch]=+b; return o;
},{});

function FixLatin1Mojibake(input) {
  if (typeof input!=='string' || !input.length) return input;
  x++;

  input = input.replace('â€�', '”');
  if (x === 4) {
    console.log('input here: ', input);
  }

  // 1) rebuild raw bytes
  const bs = [];
  for (const ch of input) {
    if (rv[ch]!=null) {
      bs.push(rv[ch]);
    } else {
      const c = ch.charCodeAt(0);
      bs.push(c < 256 ? c : 63); // keep low-byte, else '?'
    }
  }

  // 2) UTF-8 decode
  let out='', i=0;
  while (i < bs.length) {
  const b1 = bs[i++];

  if (b1 < 0x80) {
    out += String.fromCharCode(b1);
  } else if (b1 >= 0xC2 && b1 <= 0xDF) {
    if (i < bs.length && (bs[i] & 0xC0) === 0x80) {
      const b2 = bs[i++];
      out += String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
    } else {
      // invalid sequence, skip or insert replacement
      out += '\uFFFD';
    }
  } else if (b1 >= 0xE0 && b1 <= 0xEF) {
    if (
      i + 1 < bs.length &&
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
      i += 2; // skip bytes anyway
    }
  } else if (b1 >= 0x80 && b1 <= 0x9F) {
    out += mp[b1] || '\uFFFD';
  } else {
    out += String.fromCharCode(b1);
  }
}

  return out;
}

const tests = [
  { desc: 'Basic accented characters', str: 'FranÃ§ois' },
  { desc: 'Accented café', str: 'cafÃ©' },
  { desc: 'Spanish ñ', str: 'El NiÃ±o' },
  { desc: 'Curly quotes', str: 'â€œquotedâ€�' },
  { desc: 'Curly apostrophe', str: 'thatâ€™s right' },
  { desc: 'En and Em dashes', str: 'â€“ and â€”' },
  { desc: 'Trademark symbol', str: '80â€™s musicâ„¢' },
  { desc: 'German Umlaut', str: 'KÃ¼nstler' },
  { desc: 'Ellipsis', str: 'â€¦ etc.' },
  { desc: 'Full sample sentence', str: 'FranÃ§ois said “cafÃ©”. Thatâ€™s all.' },
];

console.log('=== FixLatin1Mojibake Tests ===\n');

tests.forEach(({ desc, str }, idx) => {
  console.log(`#${idx + 1} ${desc}`);
  console.log('Input :', str);
  console.log('Output:', FixLatin1Mojibake(str));
  console.log('');
});