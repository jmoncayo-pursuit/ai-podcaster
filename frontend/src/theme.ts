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
          transition: 'box-shadow 0.2s',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#41D1FF', // blue as default
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6C47FF', // purple on hover
            boxShadow: '0 0 0 2px #6C47FF55',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6C47FF', // purple on focus
            boxShadow: '0 0 0 3px #6C47FF99',
          },
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
          // Ensure label is readable when focused
          '&.Mui-focused': {
            color: '#41D1FF', // Use blue for focus for high contrast
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#f3f4f6',
          transition: 'box-shadow 0.2s',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#41D1FF', // blue as default
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6C47FF', // purple on hover
            boxShadow: '0 0 0 2px #6C47FF55',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6C47FF', // purple on focus
            boxShadow: '0 0 0 3px #6C47FF99',
          },
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
