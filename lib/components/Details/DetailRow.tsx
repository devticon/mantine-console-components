import type { StackProps } from '@mantine/core';
import { Stack, Text } from '@mantine/core';
import type { FC, ReactNode } from 'react';
import { useCallback } from 'react';

type Props = StackProps & {
  label: string;
  value?: ReactNode;
};

export const DetailRow: FC<Props> = ({ label, value, ...props }) => {
  const Content = useCallback(() => {
    if (!value || typeof value === 'number' || typeof value === 'string') {
      return <Text fw={500}>{value || '-'}</Text>;
    } else {
      return value;
    }
  }, [value]);

  return (
    <Stack gap={4} align="flex-start" {...props}>
      <Text c="dimmed" inline>
        {label}
      </Text>
      <Content />
    </Stack>
  );
};
