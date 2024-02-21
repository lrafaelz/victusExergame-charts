import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface SessionsDropdownProps {
  options: string[];
  selectedOption: string;
  onOptionChange: (selectedOption: string, selectedIndex: number) => void;
}
export const SessionsDropdown: React.FC<SessionsDropdownProps> = ({ options, selectedOption, onOptionChange }) => {

return (
    <DropdownMenu.Root >
        <DropdownMenu.Trigger className="bg-blue-500 text-white px-4 py-2 rounded" >
            {selectedOption||"Selecione a sessão"}
        </DropdownMenu.Trigger >
        <DropdownMenu.Content className="mt-2 w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10">
        {options.map((option, index) => (
          <DropdownMenu.Item key={index} onSelect={() => onOptionChange(option, index)} className='outline-none hover:bg-gray-500 hover:text-gray-50'>
            {option}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};


