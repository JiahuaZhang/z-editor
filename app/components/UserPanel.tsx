import type { User } from '@supabase/supabase-js';
import { Link, NavLink } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const getInitials = (name?: string, email?: string) => {
  if (name && name.trim() !== '') {
    return name.split(' ').map((word) => word.charAt(0).toUpperCase()).join('');
  }
  if (email && email.trim() !== '') {
    return email.charAt(0).toUpperCase();
  }
  return 'U';
};

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

      <Popover>
        <PopoverContent un-w='auto'>
          <button un-bg='blue-400 hover:white' un-text='white hover:blue-400' un-p='3' un-py='1' un-border='rounded 1 solid hover:blue-400' >
            <Link to="/logout" >
              Logout
            </Link>
          </button>
        </PopoverContent>
        <PopoverTrigger>
          <Avatar>
            <AvatarImage src={avatarUrl} alt={user.user_metadata.full_name} />
            <AvatarFallback un-bg='blue-400' un-text='white' >
              {getInitials(userName, userEmail)}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
      </Popover>
    </div>
  );
};