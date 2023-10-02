import type { PaperProps } from '@mantine/core';
import { Group, Paper, Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';

type Props = PaperProps & {
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export const DetailsBox: FC<Props> = ({ title, actions, children, ...props }) => {
  return (
    <Paper withBorder={false} p="xl" {...props}>
      <Group mb={children ? 'lg' : undefined} gap="xs" justify="space-between">
        <Title size="h5" order={3}>
          {title}
        </Title>
        {actions && <Group gap="xs">{actions}</Group>}
      </Group>
      {children}
    </Paper>
  );
};
