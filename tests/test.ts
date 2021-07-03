/// <reference types="node" />
import { generate, UniqueVersionOptions } from '../src/index';

// This is a very simple list of tests
let runTests = 0;
let validTests = 0;
let sections = 0;

const test1 = generateSection('Empty string', {
  input: '',
  type: 'string'
});

mustBeDefined(test1);
mustBeNull(test1.full);
mustBeNull(test1.major);
mustBeNull(test1.minor);
mustBeNull(test1.patch);
mustBeNull(test1.hash);

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
mustBeNull(test8.full);
mustBeNull(test8.major);
mustBeNull(test8.minor);
mustBeNull(test8.patch);

const test9 = generateSection('No digits hash', {
  input: '1.0.0',
  type: 'string',
  hashSize: 0
});

mustBeDefined(test9);
mustBeNull(test9.full);
mustBeNull(test9.major);
mustBeNull(test9.minor);
mustBeNull(test9.patch);

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

function generateSection(name: string, options: UniqueVersionOptions) {
  if(sections > 0) { // Put an empty line after first section
    console.log();
  }

  ++sections;
  const sectionName = `${sections}: ${name}`;

  console.log(sectionName);
  console.log('-'.repeat(sectionName.length));

  return generate(options);
}
