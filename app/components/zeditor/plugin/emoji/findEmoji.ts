import emojis from 'emoji-datasource-facebook/emoji.json';

export type EmojiMatch = Readonly<{
  position: number;
  shortcode: string;
  unifiedID: string;
}>;

export const emojiReplacementMap = emojis.reduce<Map<string, string>>((acc, row) => {
  if (!row.has_img_facebook) {
    return acc;
  }

  acc.set(`:${row.short_name}:`, row.unified);

  if (row.text != null) {
    acc.set(row.text, row.unified);
  }
  row.texts?.forEach(text => acc.set(text, row.unified));

  return acc;
}, new Map());

export const findEmoji = (text: string) => {
  const skippedText: string[] = [];

  for (const word of text.split(' ')) {
    if (!emojiReplacementMap.has(word)) {
      skippedText.push(word);
      continue;
    }

    if (skippedText.length > 0) {
      skippedText.push('');
    }

    return {
      position: skippedText.join(' ').length,
      shortcode: word,
      unifiedID: emojiReplacementMap.get(word)
    } as EmojiMatch;
  }
};
