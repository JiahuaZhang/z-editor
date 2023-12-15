import { Popover, Tag } from 'antd';
import { Suspense } from 'react';

const Bar = () => {
  return <div>
    <Popover>
      <Tag>
        tag
      </Tag>
    </Popover>
  </div>;
};

const Foo = () => <Suspense>
  <section un-m='2' >
    <Bar />
  </section>
</Suspense>;

export default Bar;