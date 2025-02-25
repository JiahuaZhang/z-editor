import { expect, test } from 'vitest';
import { fullHeaderRegexp, partialHeaderRegExp } from './generate-option';

test('heading', () => {
  const tests = [
    'heading 1',
    'heading 2',
    'heading 3',
    'heading4',
    'heading5',
    'heading6',
    'Heading 1',
    'Heading 2',
    'Heading 3',
    'Heading4',
    'Heading5',
    'Heading6',
    'head 1',
    'head 2',
    'head3',
    'Head 4',
    'Head 5',
    'Head6',
    'Header 1',
    'Header 2',
    'Header3',
    'Header4',
    'Header 5',
    'Header 6',
    'h1',
    'h2',
    'H1',
    'H2',
    'h 4',
    'H 6'
  ];

  tests.forEach(test => {
    const result = fullHeaderRegexp.exec(test);
    expect(result).toBeTruthy();
  });

  const failTests = [
    'heading 7',
    'hEading 6',
    'head 7',
    'hEad 6',
    'headeR 1',
    'HeAder5',
    'h8',
    'H 9'
  ];

  failTests.forEach(test => {
    const result = fullHeaderRegexp.exec(test);
    expect(result).toBeNull();
  });
});

test('partial heading', () => {
  const tests = [
    'h',
    'H',
    'h ',
    'H ',
    'he',
    'hea',
    'head',
    'head ',
    'heade',
    'header',
    'header ',
    'headi',
    'headin',
    'heading',
    'heading ',
    'He',
    'Hea',
    'Head',
    'Head ',
    'Heade',
    'Header',
    'Header ',
    'Headi',
    'Headin',
    'Heading',
    'Heading ',
  ];

  tests.forEach(test => {
    const result = partialHeaderRegExp.exec(test);
    expect(result).not.toBeNull()
  });
});