import type { MantineThemeOverride } from '@mantine/core';

export const baseTheme: MantineThemeOverride = {
  components: {
    Text: {
      defaultProps: {
        size: 'sm',
      },
    },
    Modal: {
      styles: {
        title: {
          fontWeight: 'bold',
        },
      },
    },
    Drawer: {
      styles: {
        title: {
          fontWeight: 'bold',
        },
      },
    },
    Select: {
      defaultProps: {
        checkIconPosition: 'right',
      },
    },
    NumberInput: {
      defaultProps: {
        hideControls: true,
        decimalSeparator: ',',
      },
    },
  },
};
