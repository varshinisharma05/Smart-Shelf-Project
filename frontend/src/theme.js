import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff9800', // Orange
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

export default theme;