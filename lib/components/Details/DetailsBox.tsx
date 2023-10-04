import type { PaperProps, TitleOrder, TitleSize } from '@mantine/core';
import { Group, Paper, Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';

type Props = PaperProps & {
  title?: string;
  titleSize?: TitleSize;
  titleOrder?: TitleOrder;
  actions?: ReactNode;
  children?: ReactNode;
};

export const DetailsBox: FC<Props> = ({ title, titleSize, titleOrder, actions, children, ...props }) => {
  return (
    <Paper p="xl" {...props}>
      {title && (
        <Group mb={children ? 'lg' : undefined} gap="xs" justify="space-between">
          <Title size={titleSize || 'h5'} order={titleOrder || 3}>
            {title}
          </Title>
          {actions && <Group gap="xs">{actions}</Group>}
        </Group>
      )}
      {children}
    </Paper>
  );
};
