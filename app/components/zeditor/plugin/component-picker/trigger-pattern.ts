export const slashPattern = (text: string) => {
  if (text === '/') return { leadOffset: 0, matchingString: '', replaceableString: '/' };

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

  return null;
};

export const dollarPattern = (text: string) => {
  if (text === '/') return { leadOffset: 0, matchingString: '', replaceableString: '/' };

  const match = /(^|\s|\()([$](?=\w)([\w\-]*(?: [\w\-]+)*)\s?)$/.exec(text);
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

  return null;
};