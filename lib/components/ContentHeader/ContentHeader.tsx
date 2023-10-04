import type { GroupProps } from '@mantine/core';
import { Anchor, Breadcrumbs, Group, Title } from '@mantine/core';
import { Link } from '@remix-run/react';
import type { FC, ReactNode } from 'react';

type Props = GroupProps & {
  title: string;
  breadcrumbs?: { label: string; path: string }[];
  actions?: ReactNode;
};

export const ContentHeader: FC<Props> = ({ title, breadcrumbs, actions, ...props }) => {
  return (
    <Group gap="xl" justify="space-between" align="center" {...props}>
      {breadcrumbs?.length ? (
        <Breadcrumbs>
          {breadcrumbs.map(({ path, label }) => (
            <Anchor key={path} fw={500} fz={26} lh="md" component={Link} to={path}>
              {label}
            </Anchor>
          ))}
          <Title order={2} lh="md">
            {title}
          </Title>
        </Breadcrumbs>
      ) : (
        <Title order={2} lh="md">
          {title}
        </Title>
      )}
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
};
