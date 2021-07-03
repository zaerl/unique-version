import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export interface UniqueVersionOptions {
  input: string;
  type?: 'file' | 'string';
  hashSize?: number;
  git?: boolean;
}

export interface UniqueVersion {
  full: string | null;
  major: string | null;
  minor: string | null;
  patch: string | null;
  hash: string | null;
}

// Generate a unique version
export function generate(options?: UniqueVersionOptions): UniqueVersion {
  const defaults: UniqueVersionOptions = {
    input: 'package.json', // Read the package.json file
    type: 'file', // Default read the file
    hashSize: 7, // The hash is 7 letters long
    git: true // Use git for generating the hash
  };

  const ret: UniqueVersion = {
    full: null,
    major: null,
    minor: null,
    patch: null,
    hash: null
  }

  options = {
    ...defaults,
    ...options
  };

  if(options.input === '') {
    return ret;
  }

  if(typeof options.hashSize === 'undefined' || options.hashSize <= 0 ||
    options.hashSize > 40) {
    return ret;
  }

  let version = '';

  if(options.type === 'file') {
    try {
      // Try to read the JSON file
      const appPackage = JSON.parse(readFileSync(options.input).toString());

      version = appPackage.version;
    } catch(error) { // Not a valid JSON
      return ret;
    }
  } else if(options.type === 'string') {
    version = options.input;
  }

  // Not a string
  if(typeof version !== 'string') {
    return ret;
  }

  // Generate the components
  const components: string[] = version.split('.');
  components[0] = typeof components[0] !== 'undefined' ? components[0] : '',
  components[1] = typeof components[1] !== 'undefined' ? components[1] : '',
  components[2] = typeof components[2] !== 'undefined' ? components[2] : ''

  ret.full = version;
  ret.major = components[0];
  ret.minor = components[1];
  ret.patch = components[2];
  ret.hash = '';

  try {
    let hash = '';

    if(options.git) {
      // Call git
      hash = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      hash = hash.substr(0, options.hashSize);
    } else {
      // Generate a random string
      const characters = 'abcdef0123456789';

      for(let i = 0; i < options.hashSize; ++i) {
        hash += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }

    ret.full = `${version}-${hash}`;
    ret.hash = hash;
  } catch(error) {
    return ret;
  }

  return ret;
}
