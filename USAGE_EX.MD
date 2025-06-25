# `utf8-sanitize` Usage

# Functions
```js
FullSanitize(input, options) // => string
//Provides a full pipeline to validate byte length, repair encoding, and sanitize a string, options passed to SanitizeInput

FixLatin1Corrupt(input) // => string
//Repairs mojibake corruption in latin1 single-byte to multi-byte UTF-8 character conversion with no dependencies

VerifyByteLength(input) // => boolean
// Check if a string size matches its expected or safe 32-bit size

SanitizeInput(input, options) // => string
// Cleans string by removing or escaping characters based on a sanitization mode specified in options (alphanumeric, html, filename)

MAX_SAFE_CHAR_LIMIT // => number
// Used by VerifyByteLength, max safe limit is 2^28 - 16 on V8 32-bit, rounded down to nearest hundred
```

## Options
### *Options are passed from* `FullSanitize` *for use in* `SanitizeInput`
* All modes remove common C0/C1 control and zero-width/invisible space characters
* Mode `alphanumeric` removes non-alphanumeric characters
* Mode `html` escapes tags such as `<script>` to prevent XSS
* Mode `filename` cleans characters disallowed in filenames on Win/OSX
* `keepSpaces` parameter is only used in `alphanumeric` mode 
  * Decides whether to clean spaces from input or not
    * Defaults to true (keep) if unspecified

## `FullSanitize` Usage Examples
#### `alphanumeric`
```js
const options = {
    mode: 'alphanumeric',
    keepSpaces: false
};

const input = 'User: Ã©l (123)';
const result = FullSanitize(input, options);
// Expected output: "Userél123"
```
#### `html`
```js
const options = {
    mode: 'html'
};

const input = 'Ã© input <script>alert("XSS")</script>';
const result = FullSanitize(input, options);
// Expected output: "él input <script>alert("XSS")</script>"
```

#### `filename`
```js
const options = {
    mode: 'filename'
};

const input = 'Report <Q1/2025> | Final Ã©?.txt';
const result = FullSanitize(input, options);
// Expected output: "Report Q12025  Final él.txt"
```