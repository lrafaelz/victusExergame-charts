import { useState } from 'react';

export const useSessionsDropdown = (
  options: string[],
  onOptionChange: (selectedOption: string, index: number) => void,
) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleOptionChange = (option: string, index: number) => {
    setSelectedOption(option);
    setSelectedIndex(index);
    onOptionChange(option, index);
  };

  const isDropdownDisabled = options.length === 0;

  return {
    selectedOption,
    selectedIndex,
    handleOptionChange,
    isDropdownDisabled,
  };
};
