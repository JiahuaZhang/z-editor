import { RenderElementProps } from 'slate-react';

export const H1 = ({ children, attributes }: RenderElementProps) => {
  return <h1
    un-text='4xl blue-950'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h1>;
};

export const H1DropDown = () => <h1 un-text='4xl blue-950'
  un-font='bold'
  un-leading='tight'>Heading h1</h1>;

export const H2 = ({ children, attributes }: RenderElementProps) => {
  return <h2
    un-text='3xl blue-900'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h2>;
};

export const H2DropDown = () => <h2 un-text='3xl blue-900'
  un-font='bold'
  un-leading='tight'>Heading h2</h2>;

export const H3 = ({ children, attributes }: RenderElementProps) => {
  return <h3
    un-text='2xl blue-800'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h3>;
};

export const H3DropDown = () => <h3 un-text='2xl blue-800'
  un-font='bold'
  un-leading='tight'>Heading h3</h3>;

export const H4 = ({ children, attributes }: RenderElementProps) => {
  return <h4
    un-text='xl blue-700'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h4>;
};

export const H4DropDown = () => <h4 un-text='xl blue-700'
  un-font='bold'
  un-leading='tight'>Heading h4</h4>;

export const H5 = ({ children, attributes }: RenderElementProps) => {
  return <h5
    un-text='lg blue-600'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h5>;
};

export const H5DropDown = () => <h5 un-text='lg blue-600'
  un-font='bold'
  un-leading='tight'>Heading h5</h5>;

export const H6 = ({ children, attributes }: RenderElementProps) => {
  return <h6
    un-text='base blue-500'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h6>;
};

export const H6DropDown = () => <h6 un-text='base blue-500'
  un-font='bold'
  un-leading='tight'>Heading h6</h6>;

export const P = ({ children, attributes }: RenderElementProps) => {
  return <p {...attributes} >
    {children}
  </p>;
};

export const PDropDown = () => <p>paragraph</p>;

export const Blockquote = ({ children, attributes }: RenderElementProps) => {
  return <blockquote
    un-text='gray-700'
    un-border='l-4 gray-400'
    un-p='l-4'
    un-font='italic'
    {...attributes} >
    {children}
  </blockquote>;
};

export const BlockquoteDropDown = () => <blockquote un-text='gray-700'
  un-border='l-4 gray-400'
  un-p='l-4'
  un-font='italic'>blockquote</blockquote>;

export const dummyData = [
  {
    type: 'p',
    children: [{ text: 'Try it out for yourself!' }],
  },
  {
    type: 'h1',
    children: [{ text: 'Heading 1 here' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Heading 2 here' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Heading 3 here' }],
  },
  {
    type: 'h4',
    children: [{ text: 'Heading 4 here' }],
  },
  {
    type: 'h5',
    children: [{ text: 'Heading 5 here' }],
  },
  {
    type: 'h6',
    children: [{ text: 'Heading 6 here' }],
  },
  {
    type: 'p',
    children: [{ text: 'A line of text in a paragraph' }],
  },
  {
    type: 'blockquote',
    children: [{ text: 'A line of text in a blockquote' }],
  },
];
