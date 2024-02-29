import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface PatientNamesDropdownProps {
  options: string[];
  selectedOption: string;
  onOptionChange: (selectedOption: string) => void;
}

export const PatientNamesDropdown: React.FC<PatientNamesDropdownProps> = ({  options, selectedOption, onOptionChange  }) => {

  return (
    <DropdownMenu.Root>
    <DropdownMenu.Trigger className="bg-orangeVictus text-white px-4 py-2 rounded my-4">
        {selectedOption||"Selecione o paciente"}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content className=" w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10" >
        {options.map((option, index) => (
        <DropdownMenu.Item  key={index} onSelect={() => onOptionChange(option)} className='outline-none hover:bg-gray-500 hover:text-gray-50'>
            {option}
        </DropdownMenu.Item>
        ))}
    </DropdownMenu.Content>
</DropdownMenu.Root>
  );
};