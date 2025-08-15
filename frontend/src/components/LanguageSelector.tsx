import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (event: React.ChangeEvent<{ value: unknown }>) => {
    const language = event.target.value as string;
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120, marginLeft: 2 }}>
      <InputLabel id="language-select-label">Language</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={i18n.language}
        label="Language"
        onChange={changeLanguage as any}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="zh">中文</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector; 