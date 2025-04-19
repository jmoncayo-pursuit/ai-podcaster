import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#181a1f',
      paper: '#23262F',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#b0b3b8',
    },
    primary: {
      main: '#6C47FF',
      contrastText: '#fff',
    },
    secondary: {
      main: '#41D1FF',
      contrastText: '#fff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#fff',
          background:
            'linear-gradient(90deg, #6C47FF 0%, #41D1FF 100%)',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#f3f4f6',
        },
        input: {
          color: '#f3f4f6',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#f3f4f6',
        },
        input: {
          color: '#f3f4f6',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#f3f4f6',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#f3f4f6',
        },
        icon: {
          color: '#f3f4f6',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#f3f4f6',
        },
      },
    },
  },
});

export default darkTheme;
