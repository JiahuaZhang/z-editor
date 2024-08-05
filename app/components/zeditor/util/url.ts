// Source: https://stackoverflow.com/a/8234912/2013580
export const validateUrl = (text: string) => /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(text);

const createLinkMatcherWithRegExp = (
  regExp: RegExp,
  urlTransformer: (text: string) => string = (text) => text,
) => (text: string) => {
  const match = regExp.exec(text);
  if (match === null) return null;

  return {
    index: match.index,
    length: match[0].length,
    text: match[0],
    url: urlTransformer(match[0]),
  };
};

const URL_REGEX = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;
const EMAIL_REGEX = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

export const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => text.startsWith('http') ? text : `https://${text}`),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => `mailto:${text}`)
];
