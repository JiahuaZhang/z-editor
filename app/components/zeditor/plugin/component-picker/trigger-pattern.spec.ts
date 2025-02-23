import { expect, test } from 'vitest';
import { slashPattern } from './trigger-pattern';

const PUNCTUATION = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';

const useBasicTypeaheadTriggerMatch = (
  trigger: string,
  { minLength = 1, maxLength = 75 }: { minLength?: number; maxLength?: number; },
) => {
  return (text: string) => {
    const validChars = '[^' + trigger + PUNCTUATION + '\\s]';
    const TypeaheadTriggerRegex = new RegExp(
      '(^|\\s|\\()(' +
      '[' +
      trigger +
      ']' +
      '((?:' +
      validChars +
      '){0,' +
      maxLength +
      '})' +
      ')$',
    );
    const match = TypeaheadTriggerRegex.exec(text);
    if (match !== null) {
      const maybeLeadingWhitespace = match[1];
      const matchingString = match[3];
      if (matchingString.length >= minLength) {
        return {
          leadOffset: match.index + maybeLeadingWhitespace.length,
          matchingString,
          replaceableString: match[2],
        };
      }
    }
    return null;
  };
};
const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', { minLength: 1 });

test('simple', () => {
  const tests = [
    ['no trigger', false],
    [' /hello', true],
    ['(/good', true],
    ['       (     (      (      /test', true],
    ['/', false],
    ['/a', true],
    ['/foo', true],
    ['/ bar', false],
    ['/ba z', true],
    ['/cmd param1', true],
    ['                       /cmd param1', true],
    ['/cmd space ', true],
    ['/cmd fail  ', false],
    ['/cmd fail  spaces', false],
    ['/cmd still fails ending spaces      ', false],
    ['/cmd param1 param2', true],
    ['/cmd hyphen-space param1', true],
    ['/connected-by-hyphen-style-here', true],
    ['/cmd hyphen-param param2 hyphen-other', true],
    ['/cmd param1 param2 parm3 param4 param5 param6 param7', true],
  ] as const;

  tests.forEach(test => {
    // const expected = checkForTriggerMatch(test[0]);
    const result = slashPattern(test[0]);
    if (test[1]) {
      expect(result).not.toBeNull();
    } else {
      expect(result).toBeNull();
    }

    // console.log(`${test}: `, expected, result);
  });
});