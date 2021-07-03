/// <reference types="node" />
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { generate, UniqueVersion, UniqueVersionOptions } from '../src/index';

// This is a very simple list of tests
let runTests = 0;
let validTests = 0;
let sections = 0;

const test1 = generateSection('Empty string', {
  input: '',
  type: 'string'
});

mustBeDefined(test1);
mustAllBeNull(test1);

const test2 = generateSection('1-digits version', {
  input: '1',
  type: 'string'
});

mustBeDefined(test2);
mustBe(test2.major, '1');
mustBe(test2.minor, '');
mustBe(test2.patch, '');

const test3 = generateSection('2-digits version', {
  input: '1.0',
  type: 'string'
});

mustBeDefined(test3);
mustBe(test3.major, '1');
mustBe(test3.minor, '0');
mustBe(test3.patch, '');

const test4 = generateSection('3-digits version', {
  input: '1.0.0',
  type: 'string'
});

mustBeDefined(test4);
mustBe(test4.major, '1');
mustBe(test4.minor, '0');
mustBe(test4.patch, '0');

const test5 = generateSection('4-digits version', {
  input: '1.0.0.0',
  type: 'string'
});

mustBeDefined(test5);
mustBe(test5.major, '1');
mustBe(test5.minor, '0');
mustBe(test5.patch, '0');

const test6 = generateSection('7-digits default hash', {
  input: '1.0.0',
  type: 'string'
});

mustBeDefined(test6);
mustRegexBe(test6.full, '1\.0\.0\-[a-f0-9]{7}');
mustBe(test6.major, '1');
mustBe(test6.minor, '0');
mustBe(test6.patch, '0');
mustRegexBe(test6.hash, '[a-f0-9]{7}');
mustBe((test6.full)?.split('-')[1], test6?.hash);

const test7 = generateSection('12-digits hash', {
  input: '1.0.0',
  type: 'string',
  hashSize: 12
});

mustBeDefined(test7);
mustRegexBe(test7.hash, '[a-f0-9]{12}');
mustRegexBe(test7.full, '1\.0\.0\-[a-f0-9]{12}');
mustBe((test7.full)?.split('-')[1], test7.hash);
mustBe(test7.hash?.substring(0, 7), test6.hash);

const test8 = generateSection('41-digits hash', {
  input: '1.0.0',
  type: 'string',
  hashSize: 41
});

mustBeDefined(test8);
mustAllBeNull(test8);

const test9 = generateSection('No digits hash', {
  input: '1.0.0',
  type: 'string',
  hashSize: 0
});

mustBeDefined(test9);
mustAllBeNull(test9);

const test10 = generateSection('No git hash', {
  input: '1.0.0',
  type: 'string',
  git: false
});

mustBeDefined(test10);
mustRegexBe(test10.full, '1\.0\.0\-[a-f0-9]{7}');
mustBe(test10.major, '1');
mustBe(test10.minor, '0');
mustBe(test10.patch, '0');
mustRegexBe(test10.hash, '[a-f0-9]{7}');
mustBe((test10.full)?.split('-')[1], test10?.hash);

const test11 = generateSection('Simple package.json', {
  input: './tests/simple.json'
});

mustBeDefined(test11);
mustAllBe(test11, test4); // 3-digits git

const test12 = generateSection('Empty package.json', {
  input: './tests/empty.json'
});

mustBeDefined(test12);
mustAllBeNull(test12);

const test13 = generateSection('Not a JSON', {
  input: './tests/not-json.txt'
});

mustBeDefined(test13);
mustAllBeNull(test13);

const test14 = generateSection('Not a file', {
  input: './not-a-file'
});

mustBeDefined(test14);
mustAllBeNull(test14);

const test15 = generateSection('All defaults');

// Library package.json file
const appPackage = JSON.parse(readFileSync('package.json').toString());
const components: string[] = appPackage.version.split('.');

mustBeDefined(test15);
mustBe(test15.major, components[0]);
mustBe(test15.minor, components[1]);
mustBe(test15.patch, components[2]);

// Summary
output(validTests === runTests, `\nTests: ${validTests}/${runTests}`);

process.exit(validTests === runTests ? 0 : 1);

function mustBeDefined(arg: any, not = false) {
  return tests(typeof arg !== 'undefined', not,
    `Must${not ? ' not' : ''} be "defined"`);
}

function mustBeNull(arg: any, not = false) {
  return tests(arg === null, not, `Must${not ? ' not' : ''} be "null"`);
}

function mustBe(arg: any, value: any, not = false) {
  return tests(arg === value, not, `Must${not ? ' not' : ''} be "${value}"`);
}

function mustRegexBe(arg: any, expression: string, not = false) {
  const regex = new RegExp(expression);

  return tests(regex.test(arg), not, `Must regex "${expression}"${not ? ' not' : ''} be valid`);
}

function mustAllBe(unique1: UniqueVersion, unique2: UniqueVersion) {
  mustBe(unique1.full, unique1.full);
  mustBe(unique1.major, unique1.major);
  mustBe(unique1.minor, unique1.minor);
  mustBe(unique1.patch, unique1.patch);
  return mustBe(unique1.hash, unique1.hash);
}

function mustAllBeNull(unique: UniqueVersion) {
  mustBeNull(unique.full);
  mustBeNull(unique.major);
  mustBeNull(unique.minor);
  mustBeNull(unique.patch);
  return mustBeNull(unique.hash);
}

function tests(valid: boolean, not = false, message: string) {
  ++runTests;
  const validity = not ? !valid : valid;

  if(validity) {
    ++validTests;
  }

  output(validity, message);

  return validity;
}

function output(valid: boolean, message: string) {
  if(valid) {
    console.log(`\x1b[32m${message}\x1b[0m`);
  } else {
    console.error(`\x1b[31m${message}\x1b[0m`);
  }
}

function generateSection(name: string, options?: UniqueVersionOptions) {
  if(sections > 0) { // Put an empty line after first section
    console.log();
  }

  ++sections;
  const sectionName = `${sections}: ${name}`;

  console.log(sectionName);
  console.log('-'.repeat(sectionName.length));

  return generate(options);
}
