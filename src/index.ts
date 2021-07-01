import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export interface UniqueVersionOptions {
  input: string;
  type?: 'file' | 'string';
  hashSize?: number;
  hash?: string;
  git?: boolean;
}

export interface UniqueVersion {
  full: string;
  major: string;
  minor: string;
  patch: string;
  hash: string;
}

// Generate a unique version
export function generate(options: UniqueVersionOptions): UniqueVersion | undefined {
  const defaults: UniqueVersionOptions = {
    input: 'package.json', // Read the package.json file
    type: 'file', // Default read the file
    hashSize: 7, // The hash is 7 letters long
    git: true // Use git for generating the hash
  };

  options = {
    ...defaults,
    ...options
  };

  if(options.input === '') {
    return;
  }

  let version = '';

  if(options.type === 'file') {
    // Try to read the JSON file
    const appPackage = JSON.parse(readFileSync(options.input).toString());

    version = appPackage.version;
  } else if(options.type === 'string') {
    version = options.type;
  }

  // Generate the components
  const components: string[] = version.split('.');
  components[0] = typeof components[0] !== 'undefined' ? components[0] : '',
  components[1] = typeof components[1] !== 'undefined' ? components[1] : '',
  components[2] = typeof components[2] !== 'undefined' ? components[2] : ''

  const ret = {
    full: version,
    hash: '',
    major: components[0],
    minor: components[1],
    patch: components[2]
  };

  try {
    // Call git
    let hash = execSync('git rev-parse HEAD', { stdio: 'ignore' }).toString();
    hash = hash.substr(0, options.hashSize);

    ret.full = `${version}-${hash}`;
  } catch(error) {
    console.log(error);
    return;
  }

  return ret;
}
