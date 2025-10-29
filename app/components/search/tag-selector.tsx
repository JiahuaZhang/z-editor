import { useState } from 'react';

type TagSelectorProps = {
  tagStats: { tag_name: string; document_count: number; }[];
  onTagSelect: (tag: string) => void;
};

export const TagSelector = ({ tagStats, onTagSelect }: TagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = tagStats.filter(stat => stat.tag_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!tagStats.length) return null;

  return (
    <div un-relative="~">
      <input
        type="text"
        placeholder="Add tag"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={event => {
          if (searchTerm && event.key === 'Enter' && filteredTags.length === 1) {
            onTagSelect(filteredTags[0].tag_name);
          }
        }}
        un-px="3" un-py="1" un-text="sm" un-border="~ gray-300" un-rounded="full" un-bg="white hover:gray-50" un-outline="none" un-ring="focus:2 focus:blue-500" un-border-focus="blue-500" un-w="32"
      />
      {isOpen && (
        <div un-absolute="~ top-full left-0" un-mt="1" un-w="120" un-bg="white" un-border="~ gray-200" un-rounded="lg" un-shadow="lg" un-z="50">
          <div un-max-h="70" un-overflow="y-auto" un-p="2">
            {filteredTags.length > 0 ? (
              <div un-flex="~ wrap" un-gap="2">
                {filteredTags.map(stat => (
                  <span
                    key={stat.tag_name}
                    un-inline-flex="~" un-items='center' un-px="2" un-py="1" un-bg="blue-100 hover:blue-800" un-cursor="pointer" un-rounded="full" un-text="sm blue-800 hover:white" un-gap="1" un-whitespace="nowrap"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onTagSelect(stat.tag_name)}
                  >
                    <span>#{stat.tag_name}</span>
                    <span un-text="white" un-bg="slate-400" un-px="1" un-border="rounded" un-leading="none">{stat.document_count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div un-px="3" un-py="4" un-text="center gray-500 sm">
                🔍 No matching tag
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
