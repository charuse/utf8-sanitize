# `utf8-sanitize`

[![NPM version](https://img.shields.io/npm/v/utf8-sanitize.svg)](https://npmjs.org/package/utf8-sanitize)

> UTF-8 Sanitization and Repair Utility

A lightweight, performant utility with zero dependencies to sanitize and repair UTF-8 text including:
* **🛠️** Repairing mojibake corruption in latin1 single-byte to multi-byte UTF-8 character conversion
* **📏** Check if a string's length matches its expected or safe 32-bit length
* **🚫** Cleans string by removing/escaping characters based on a specifiable sanitization mode
* **🔄** Function that provides a full pipeline for repair and sanitization through `FullSanitize`


# Install

```bash
npm install utf8-sanitize
```


# Usage
### Import:
```sh
const { FullSanitize } = require ('utf8-sanitize') # Import pipeline
const { FullSanitize, FixLatin1Corrupt, VerifyByteLength, SanitizeInput, MAX_SAFE_CHAR_LIMIT } = require ('utf8-sanitize') # Import all
```

### Functions:
```js
FullSanitize(); // => string
// Full pipeline for mojibake repair from latin1 to UTF-8 string encoding, verifies expected string length and sanitizes string

FixLatin1Corrupt() // => string
// Repairs mojibake corruption from latin1 single-byte to multi-byte UTF-8 character conversion

VerifyByteLength() // => boolean
// Check if a string's length matches its expected or safe 32-bit length

SanitizeInput() // => string
// Cleans string by removing/escaping characters based on a sanitization mode specifiable via options (alphanumeric, html, filename)

MAX_SAFE_CHAR_LIMIT // => number
// Max safe V8 32-bit character string limit used by VerifyByteLength()
```

***Check*** `USAGE_EX.MD` ***for in-depth function usage examples***


# Credit
### **Author:** *[charuse](https://github.com/charuse)*

### **License:** *[MIT](https://opensource.org/license/mit)*

#### *Made with the help of [Google Gemini 2.5 Pro](https://aistudio.google.com)*