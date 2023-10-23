import { FacebookEmbed, InstagramEmbed, LinkedInEmbed, PinterestEmbed, TikTokEmbed, TwitterEmbed } from 'react-social-media-embed';
import { Editor, Transforms } from 'slate';
import { RenderElementProps } from 'slate-react';

export const EMBED_TYPES = ['youtube', 'facebook', 'instagram', 'linkedIn', 'pinterest', 'tiktok', 'twitter'];

const YouTube = ({ children, element, ...rest }: RenderElementProps) => {
  const { id } = element as any;
  return <div
    un-position='relative'
    un-w='full'
    un-max-w='[1280px]'
    un-p='b-[39.54%]'
    un-mx='auto'
    contentEditable={false}
    {...rest}
  >
    <iframe
      src={`https://www.youtube.com/embed/${id!}`}
      aria-label="Youtube video"
      un-position='absolute'
      un-top='0'
      un-left='0'
      un-w='full'
      un-h='full'
    />
    {children}
  </div>;
};

const Facebook = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center'{...rest} >
    <FacebookEmbed url={url!} />
    {children}
  </div>;
};

const Instagram = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <InstagramEmbed url={url!} width={500} />
    {children}
  </div>;
};

const LinkedIn = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <LinkedInEmbed url={url!} width={500} />
    {children}
  </div>;
};

const Pinterest = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <PinterestEmbed url={url!} height={540} />
    {children}
  </div>;
};

const TikTok = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <TikTokEmbed url={url!} />
    {children}
  </div>;
};

const Twitter = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <TwitterEmbed url={url!} width={400} />
    {children}
  </div>;
};

export const renderEmbed = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'youtube':
      return <YouTube {...props} />;
    case 'facebook':
      return <Facebook {...props} />;
    case 'instagram':
      return <Instagram {...props} />;
    case 'linkedin':
      return <LinkedIn {...props} />;
    case 'pinterest':
      return <Pinterest {...props} />;
    case 'tiktok':
      return <TikTok {...props} />;
    case 'twitter':
      return <Twitter {...props} />;
  }
  return null;
};

const handleYouTube = (text: string, editor: Editor) => {
  const youtubeRegex = /^(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:(?:youtube\.com|youtu.be))(?:\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(?:\S+)?$/;

  const matches = text.match(youtubeRegex);
  if (!matches) { return false; }

  const [_, id] = matches;
  Transforms.insertNodes(
    editor, [{ type: 'youtube', id, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleFacebook = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?facebook\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'facebook', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleInstagram = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?instagram\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'instagram', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleLinkedIn = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?linkedin\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'linkedin', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handlePinterest = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?pinterest\.(com|co\.uk).*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'pinterest', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleTikTok = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?tiktok\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'tiktok', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleTwitter = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?twitter\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'twitter', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

export const handleEmbed = (text: string, editor: Editor) => {
  return [handleYouTube, handleFacebook, handleInstagram, handleLinkedIn, handlePinterest, handleTikTok, handleTwitter]
    .some(fn => fn(text, editor));
};