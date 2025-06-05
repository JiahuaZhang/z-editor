import type { User } from '@supabase/supabase-js';
import { Avatar, Menu, MenuProps, Popover } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router';

const getInitials = (name?: string, email?: string) => {
  if (name && name.trim() !== '') {
    return name.split(' ').map((word) => word.charAt(0).toUpperCase()).join('');
  }
  if (email && email.trim() !== '') {
    return email.charAt(0).toUpperCase();
  }
  return 'U';
};

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    label: <Link to="z-editor/search" >
      Search
    </Link>,
    key: 'search',
    icon: <div className="i-material-symbols-light:search" un-text='2xl' />
  },
];

export const UserPanel = ({ user }: { user: User; }) => {
  const [current, setCurrent] = useState('search');
  if (!user) {
    return null;
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.user_metadata?.name;
  const userEmail = user.email;

  const logoutContent = <button un-bg='blue-4 hover:white' un-text='white hover:blue-4' un-p='3' un-py='1' un-border='rounded' >
    <Link to="/logout">
      Logout
    </Link>
  </button>;

  return (
    <div un-flex='~' un-gap='2' >
      <div un-w='full' >
        <Menu selectedKeys={[current]} mode="horizontal" items={items} />
      </div>
      <Popover content={logoutContent} trigger="click">
        <div un-cursor="pointer" >
          {avatarUrl ? (
            <Avatar src={avatarUrl} alt={user.user_metadata.full_name} size='large' />
          ) : (
            <Avatar un-bg='blue-4' size='large' >
              {getInitials(userName, userEmail)}
            </Avatar>
          )}
        </div>
      </Popover>
    </div>
  );
};