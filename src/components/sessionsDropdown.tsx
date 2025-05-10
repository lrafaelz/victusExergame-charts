// SessionsDropdown.tsx
import React from 'react';
import { Box } from '@mui/material';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSessionsDropdown } from './sessionsDropdown.functions';

interface SessionsDropdownProps {
  options: string[];
  onOptionChange: (selectedOption: string, index: number) => void;
}

export const SessionsDropdown: React.FC<SessionsDropdownProps> = ({ options, onOptionChange }) => {
  const { selectedOption, handleOptionChange, isDropdownDisabled } = useSessionsDropdown(
    options,
    onOptionChange,
  );

  return (
    <Box>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          disabled={isDropdownDisabled}
          className={`my-5 bg-orangeVictus text-white px-4 py-2 rounded mt-5 ${
            isDropdownDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {selectedOption || 'Selecione a sessão'}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="mt-2 w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10">
          {options.map((option, itemIndex) => (
            <DropdownMenu.Item
              key={itemIndex}
              onSelect={() => handleOptionChange(option, itemIndex)}
              className="outline-none hover:bg-gray-500 hover:text-gray-50"
            >
              {option}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Box>
  );
};
