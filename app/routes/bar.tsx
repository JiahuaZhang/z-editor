import { useEffect, useRef } from 'react';

const Foo = () => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    console.log('ref', ref.current);

  }, [ref.current]);

  return <span ref={ref} >test span</span>;
};

export default Foo;