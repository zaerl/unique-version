# @zaerl/unique-version
Generate a unique version given your `package.json` version.

## Install
`npm install @zaerl/unique-version`

## Usage

```typescript
import { generate, UniqueVersion, UniqueVersionOptions } from '@zaerl/unique-version';

// If your package.json version is "1.0.0"
const version = generate({
  input: 'package.json', // Read the package.json file
  type: 'file', //Read from a file
  hashSize: 7, // Length of the hash
  git: true // Use git for generating the hash
});

console.log(version);

/*
{
  full: "1.0.0-HASH",
  major: "1",
  minor: "0",
  patch: "0",
  hash: "HASH"
}
*/
```

The `HASH` is calculated using `git rev-parse HEAD` otherwise from a random value.

Defaults:

```typescript
export interface UniqueVersionOptions {
  input: 'package.json'; // The name of the file to read or a simple string with the version
  type?: 'file' | 'string'; // 'file' to read from a 'file, 'string' from a string
  hashSize?: number; // default 7
  git?: boolean; // default true
}
```

If an error is generated all values from `UniqueVersion` will be `null`.

## License

MIT
