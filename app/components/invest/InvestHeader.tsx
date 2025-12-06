import type { User } from '@supabase/supabase-js';
import { Link, NavLink } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const getInitials = (name?: string, email?: string) => {
  if (name && name.trim() !== '') {
    return name.split(' ').map((word) => word.charAt(0).toUpperCase()).join('');
  }
  if (email && email.trim() !== '') {
    return email.charAt(0).toUpperCase();
  }
  return 'U';
};

export const InvestHeader = ({ user }: { user: User; }) => {
  if (!user) {
    return null;
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.user_metadata?.name;
  const userEmail = user.email;

  return (
    <div un-flex='~' un-gap='2' un-mb='1' >
      <div un-w='full' un-flex='~' un-items='center' >
        <NavLink to="/invest/stock" prefetch='render'>
          {({ isActive }) => <div un-flex='~' un-text={`${isActive && 'red-400'} hover:red-400`} un-gap='0.5' un-p='2'
            un-shadow='hover:[0_2px_2px_#51a2ff]'
            un-border='rounded'
          >
            <span className="i-mdi:chart-line" un-text='2xl' />
            Stock
          </div>}
        </NavLink>
        <NavLink to="/invest/option" prefetch='render'>
          {({ isActive }) => <div un-flex='~' un-text={`${isActive && 'red-400'} hover:red-400`} un-gap='0.5' un-p='2'
            un-shadow='hover:[0_2px_2px_#51a2ff]'
            un-border='rounded'
          >
            <div className="i-mdi:chart-bar" un-text='2xl' />
            Option
          </div>}
        </NavLink>
        <NavLink to="/invest/news" prefetch='render'>
          {({ isActive }) => <div un-flex='~' un-text={`${isActive && 'red-400'} hover:red-400`} un-gap='0.5' un-p='2'
            un-shadow='hover:[0_2px_2px_#51a2ff]'
            un-border='rounded'
          >
            <div className="i-mdi:newspaper" un-text='2xl' />
            News
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
