import { $isCodeNode, normalizeCodeLang } from '@lexical/code';
import { $getNearestNodeFromDOMNode, LexicalEditor } from 'lexical';
import { Options } from 'prettier';
import { useState } from 'react';

type Props = {
  lang: string;
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

const PRETTIER_PARSER_MODULES = {
  css: [() => import('prettier/parser-postcss')],
  html: [() => import('prettier/parser-html')],
  js: [
    () => import('prettier/parser-babel'),
    () => import('prettier/plugins/estree'),
  ],
  markdown: [() => import('prettier/parser-markdown')],
  typescript: [
    () => import('prettier/parser-typescript'),
    () => import('prettier/plugins/estree'),
  ],
} as const;

type LanguagesType = keyof typeof PRETTIER_PARSER_MODULES;

const loadPrettierParserByLang = async (lang: string) => {
  const dynamicImports = PRETTIER_PARSER_MODULES[lang as LanguagesType];
  const modules = await Promise.all(
    dynamicImports.map((dynamicImport) => dynamicImport()),
  );
  return modules;
}

const loadPrettierFormat = async () => {
  const { format } = await import('prettier/standalone');
  return format;
}

const PRETTIER_OPTIONS_BY_LANG: Record<string, Options> = {
  css: { parser: 'css' },
  html: { parser: 'html' },
  js: { parser: 'babel' },
  markdown: { parser: 'markdown' },
  typescript: { parser: 'typescript' },
};

const LANG_CAN_BE_PRETTIER = Object.keys(PRETTIER_OPTIONS_BY_LANG);

export const canBePrettier = (lang: string) => LANG_CAN_BE_PRETTIER.includes(lang)

const getPrettierOptions = (lang: string): Options => {
  const options = PRETTIER_OPTIONS_BY_LANG[lang];
  if (!options) {
    throw new Error(
      `CodeActionMenuPlugin: Prettier does not support this language: ${lang}`,
    );
  }

  return options;
}

export const PrettierButton = ({ lang, editor, getCodeDOMNode }: Props) => {
  const [syntaxError, setSyntaxError] = useState('');
  const [tipsVisible, setTipsVisible] = useState(false);

  const normalizedLang = normalizeCodeLang(lang);
  if (!canBePrettier(normalizedLang)) return null;

  const handleClick = async () => {
    const codeDOMNode = getCodeDOMNode();
    if (!codeDOMNode) return

    let content = '';
    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }
    });

    if (content === '') {
      return;
    }

    try {
      const format = await loadPrettierFormat();
      const options = getPrettierOptions(normalizedLang);
      const prettierParsers = await loadPrettierParserByLang(normalizedLang);
      options.plugins = prettierParsers.map(
        (parser) => parser.default || parser,
      );
      const formattedCode = await format(content, options);

      editor.update(() => {
        const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
        if ($isCodeNode(codeNode)) {
          const selection = codeNode.select(0);
          selection.insertText(formattedCode);
          setSyntaxError('');
          setTipsVisible(false);
        }
      });
    } catch (error: unknown) {
      setError(error);
    }
  }

  const setError = (error: unknown) => {
    if (error instanceof Error) {
      setSyntaxError(error.message);
      setTipsVisible(true);
    } else {
      console.error('Unexpected error: ', error);
    }
  }

  const handleMouseEnter = () => {
    if (syntaxError !== '') {
      setTipsVisible(true);
    }
  }

  const handleMouseLeave = () => {
    if (syntaxError !== '') {
      setTipsVisible(false);
    }
  }

  return (
    <div un-position='relative'>
      <button un-border={`rounded 2 solid transparent hover:blue-3 ${syntaxError && 'hover:red-4'} `} un-flex='~' un-items='center' un-text='lg'
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="prettier">
        <span className="i-logos:prettier" />
      </button>
      {tipsVisible ? (
        <pre un-position='absolute' un-right='0' un-bg='black' un-text='white' un-p='1' un-border='rounded'>{syntaxError}</pre>
      ) : null}
    </div>
  );
}
