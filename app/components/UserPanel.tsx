import type { User } from '@supabase/supabase-js';
import { Avatar, Popover } from 'antd';
import { Suspense } from 'react';
import { Link, NavLink } from 'react-router';

const getInitials = (name?: string, email?: string) => {
  if (name && name.trim() !== '') {
    return name.split(' ').map((word) => word.charAt(0).toUpperCase()).join('');
  }
  if (email && email.trim() !== '') {
    return email.charAt(0).toUpperCase();
  }
  return 'U';
};

const logoutContent = <button un-bg='blue-400 hover:white' un-text='white hover:blue-400' un-p='3' un-py='1' un-border='rounded' >
  <Link to="/logout" >
    Logout
  </Link>
</button>;

export const UserPanel = ({ user }: { user: User; }) => {
  if (!user) {
    return null;
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.user_metadata?.name;
  const userEmail = user.email;

  return (
    <div un-flex='~' un-gap='2' un-mb='1' >
      <div un-w='full' un-flex='~' un-items='center' >
        <NavLink to="/z-editor/search" prefetch='render'>
          {({ isActive }) => <div un-flex='~' un-text={`${isActive && 'blue-400'} hover:blue-400`} un-gap='0.5' un-p='2'
            un-shadow='hover:[0_2px_2px_#51a2ff]'
            un-border='rounded'
          >
            <span className="i-material-symbols-light:search" un-text='2xl' />
            Search
          </div>}
        </NavLink>
        <NavLink to="/z-editor/alert" prefetch='render'>
          {({ isActive }) => <div un-flex='~' un-text={`${isActive && 'blue-400'} hover:blue-400`} un-gap='0.5' un-p='2'
            un-shadow='hover:[0_2px_2px_#51a2ff]'
            un-border='rounded'
          >
            <span className="i-material-symbols-light:notifications" un-text='2xl' />
            Alert
          </div>}
        </NavLink>
        <NavLink to="/z-editor/new" prefetch='render'>
          {({ isActive }) => <div un-flex='~' un-text={`${isActive && 'blue-400'} hover:blue-400`} un-gap='0.5' un-p='2'
            un-shadow='hover:[0_2px_2px_#51a2ff]'
            un-border='rounded'
          >
            <div className="i-material-symbols-light:add-circle-outline" un-text='2xl' />
            New
          </div>}
        </NavLink>
      </div>
      <Suspense>
        <Popover content={logoutContent} trigger="click">
          <div un-cursor="pointer" >
            {avatarUrl ? (
              <Avatar src={avatarUrl} alt={user.user_metadata.full_name} size='large' />
            ) : (
              <Avatar un-bg='blue-400' size='large' >
                {getInitials(userName, userEmail)}
              </Avatar>
            )}
          </div>
        </Popover>
      </Suspense>
    </div>
  );
};