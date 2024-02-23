// SessionsDropdown.tsx
import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';

interface SessionsDropdownProps {
  options: string[]
  selectedOption: string
  onOptionChange: (selectedOption: string, selectedIndex: number, itemIndex: number) => void
  index: number // Adicione um índice para identificar o dropdown
}

export const SessionsDropdown: React.FC<SessionsDropdownProps> = ({ options, selectedOption, onOptionChange, index }) => {
  const [checked, setChecked] = React.useState<CheckedState>(false);
  const isDropdownDisabled = !checked;

  const handleCheckboxChange = (newChecked: boolean) => {
    setChecked(newChecked);
  };

  const handleOptionChange = (newOption: string, optionIndex: number) => {
    onOptionChange(newOption, optionIndex, index);
  } 
  // Filtrar as opções que não foram selecionadas em outros dropdow
  return (
    <div className="flex flex-col items-center">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={handleCheckboxChange}
        defaultChecked
        id="c1"
        className="bg-gray-50 w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-blue-300 focus:ring-2 focus:ring-blue"
      >
        <Checkbox.Indicator className="text-blue-500">
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          disabled={isDropdownDisabled}
          className={`my-5 bg-blue-500 text-white px-4 py-2 rounded mt-5 ${isDropdownDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {selectedOption || "Selecione a sessão"}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className={`mt-2 w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10`}>
          {options.map((option, itemIndex) => (
            <DropdownMenu.Item key={itemIndex} onSelect={() => handleOptionChange(option, itemIndex)} className='outline-none hover:bg-gray-500 hover:text-gray-50'>
              {option}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};
