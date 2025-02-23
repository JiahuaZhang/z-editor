export const slashPattern = (text: string) => {
  const match = /(^|\s|\()([/](?=\w)([\w\-]*(?: [\w\-]+)*)\s?)$/.exec(text);
  if (!match) return null;

  const maybeLeadingWhitespace = match[1];
  const matchingString = match[3];
  if (matchingString.length >= 1 && matchingString.length <= 80) {
    return {
      leadOffset: match.index + maybeLeadingWhitespace.length,
      matchingString,
      replaceableString: match[2],
    };
  }
};