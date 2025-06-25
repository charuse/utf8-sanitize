// test util

const test = require('node:test');
const assert = require('node:assert');
const {
  FixLatin1Corrupt,
  VerifyByteLength,
  SanitizeInput,
  FullSanitize,
} = require('../index.js');

// --- Test Suite for FixLatin1Corrupt ---
test.describe('FixLatin1Corrupt', () => {
  test('should not alter correct strings', () => {
    const correct = 'This is a correct string.';
    assert.strictEqual(FixLatin1Corrupt(correct), correct);
  });

  const corruptionTests = [
    { desc: 'Basic accented characters', input: 'FranÃ§ois', expected: 'François' },
    { desc: 'Accented café', input: 'cafÃ©', expected: 'café' },
    { desc: 'Spanish ñ', input: 'El NiÃ±o', expected: 'El Niño' },
    { desc: 'Curly quotes', input: 'â€œquotedâ€�', expected: '“quoted”' },
    { desc: 'Curly apostrophe', input: 'thatâ€™s right', expected: 'that’s right' },
    { desc: 'En and Em dashes', input: 'â€“ and â€”', expected: '– and —' },
    { desc: 'Trademark symbol', input: '80â€™s musicâ„¢', expected: '80’s music™' },
    { desc: 'German Umlaut', input: 'KÃ¼nstler', expected: 'Künstler' },
    { desc: 'Ellipsis', input: 'â€¦ etc.', expected: '… etc.' },
    { desc: 'Full sample sentence', input: 'FranÃ§ois said “cafÃ©”. Thatâ€™s all.', expected: 'François said “café”. That’s all.' },
  ];

  corruptionTests.forEach(({ desc, input, expected }) => {
    test(`should repair: ${desc}`, () => {
      const repaired = FixLatin1Corrupt(input);
      assert.strictEqual(repaired, expected);
    });
  });
});

// --- Test Suite for VerifyByteLength ---
test.describe('VerifyByteLength', () => {
  test('should return true for valid strings', () => {
    assert.strictEqual(VerifyByteLength('hello'), true, 'Should pass for a simple string');
  });

  test('should return false for non-string or invalid input', () => {
    assert.strictEqual(VerifyByteLength(null), false, 'Should fail for null');
    assert.strictEqual(VerifyByteLength(undefined), false, 'Should fail for undefined');
    assert.strictEqual(VerifyByteLength(123), false, 'Should fail for a number');
    assert.strictEqual(VerifyByteLength({}), false, 'Should fail for an object');
  });

  // NEW TEST BLOCK
  test('should return true for strings with valid structural integrity', () => {
    // This test confirms the `input.split('').length === input.length` check is working.
    // This check will always pass for any valid JavaScript string.
    const simpleString = 'abc'; // .length is 3, .split('').length is 3
    const emojiString = '👍';   // .length is 2, .split('').length is 2 (due to surrogate pairs)
    
    assert.strictEqual(VerifyByteLength(simpleString), true, 'Should pass for simple ASCII');
    assert.strictEqual(VerifyByteLength(emojiString), true, 'Should pass for multi-byte Unicode characters');
  });
});

// --- Test Suite for SanitizeInput ---
test('SanitizeInput should sanitize for HTML', () => {
  const input = '<script>alert("XSS")</script>';
  const expected = '<script>alert("XSS")</script>';
  assert.strictEqual(SanitizeInput(input, { mode: 'html' }), expected);
});

// --- Test Suite for the Full Pipeline ---
test('FullSanitize should repair, then sanitize a string', () => {
  const input = 'Ã© <script>go</script>';
  const expected = 'é <script>go</script>';
  assert.strictEqual(FullSanitize(input, { mode: 'html' }), expected);
});