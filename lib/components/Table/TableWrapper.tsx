import { Box, LoadingOverlay, Paper } from '@mantine/core';
import type { FC, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  loading?: boolean;
};

export const TableWrapper: FC<Props> = ({ loading, children }) => {
  return (
    <Paper style={{ overflow: 'hidden' }} withBorder radius="sm">
      <Box w="100%" pos="relative" style={{ overflowY: 'auto' }}>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} loaderProps={{ type: 'bars' }} />
        {children}
      </Box>
    </Paper>
  );
};
