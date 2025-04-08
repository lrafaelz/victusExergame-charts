import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface PatientNamesDropdownProps {
  options: string[];
  selectedOption: string;
  onOptionChange: (selectedOption: string) => void;
}

export const PatientNamesDropdown: React.FC<PatientNamesDropdownProps> = ({
  options,
  selectedOption,
  onOptionChange,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="bg-orangeVictus text-white px-4 py-2 rounded my-4"
        //  sx={{ bgcolor: 'orangeVictus', color: 'white', px: 4, py: 2, borderRadius: 1, my: 4 }}
      >
        {selectedOption || "Selecione o paciente"}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        // sx={{ width: 192, bgcolor: 'white', border: 1, borderColor: 'gray.200', divideY: 'gray.100', borderRadius: 1, boxShadow: 3, zIndex: 10 }}
        className="outline-none hover:bg-gray-500 hover:text-gray-50"
      >
        {options.map((option, index) => (
          <DropdownMenu.Item
            key={index}
            onSelect={() => onOptionChange(option)}
            // sx={{ outline: 'none', '&:hover': { bgcolor: 'gray.500', color: 'gray.50' } }}
            className="outline-none hover:bg-gray-500 hover:text-gray-50"
          >
            {option}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
