import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // The 'palette' is where you define your app's color scheme.
  palette: {
    mode: 'dark', // We'll stick with a dark theme, as you like.
    primary: {
      main: '#7B61FF', // A nice, modern purple for primary actions.
    },
    secondary: {
      main: '#3D3D3D', // A secondary color for less important elements.
    },
    background: {
      default: '#121212', // The main background color.
      paper: '#1E1E1E',   // The color for elements on top of the background, like cards.
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },

  // 'typography' is for all your text settings.
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700, // Make a specific heading bold.
    },
  },

  // 'shape' defines the border radius for components.
  shape: {
    borderRadius: 12, // Material You uses larger, softer border radiuses.
  },

  // 'components' lets you set default styles for every instance of a component.
  components: {
    // Example: Overriding the default Button styles
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Buttons will not have UPPERCASE text.
          fontWeight: 600,
          borderRadius: 8, // You can have a slightly different radius for buttons.
        },
      },
      defaultProps: {
        disableElevation: true, // Removes the drop shadow for a flatter look.
      }
    },
    // Example: Overriding Card styles
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundImage: 'none', // Removes gradient effects from paper for a cleaner look
            }
        }
    }
  },
});

export default theme;
