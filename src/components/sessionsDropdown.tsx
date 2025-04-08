// SessionsDropdown.tsx
import React from "react";
import { CheckIcon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Box } from "@mui/material";

interface SessionsDropdownProps {
  options: string[];
  selectedOption: string;
  onOptionChange: (
    selectedOption: string,
    selectedIndex: number,
    itemIndex: number
  ) => void;
  index: number; // Adicione um índice para identificar o dropdown
}

export const SessionsDropdown: React.FC<SessionsDropdownProps> = ({
  options,
  selectedOption,
  onOptionChange,
  index,
}) => {
  const [checked, setChecked] = React.useState<CheckedState>(false);
  const isDropdownDisabled = !checked;

  const handleCheckboxChange = (newChecked: boolean) => {
    setChecked(newChecked);
  };

  const handleOptionChange = (newOption: string, optionIndex: number) => {
    onOptionChange(newOption, optionIndex, index);
  };
  // Filtrar as opções que não foram selecionadas em outros dropdow
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Checkbox.Root
        checked={checked}
        onCheckedChange={handleCheckboxChange}
        defaultChecked
        id="c1"
        className="checkbox-root"
        style={{
          backgroundColor: "#f9f9fb",
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <Checkbox.Indicator style={{ color: "#FF7A00" }}>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          disabled={isDropdownDisabled}
          className={`my-5 bg-orangeVictus text-white px-4 py-2 rounded mt-5 ${
            isDropdownDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          // className={`my-5 bg-orangeVictus text-white px-4 py-2 rounded mt-5 ${isDropdownDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {selectedOption || "Selecione a sessão"}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className={`mt-2 w-48 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-10`}
        >
          {options.map((option, itemIndex) => (
            <DropdownMenu.Item
              key={itemIndex}
              onSelect={() => handleOptionChange(option, itemIndex)}
              className="outline-none hover:bg-gray-500 hover:text-gray-50"
              // sx={{
              //   outline: "none",
              //   "&:hover": { bgcolor: "gray.500", color: "gray.50" },
              // }}
            >
              {option}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Box>
  );
};
