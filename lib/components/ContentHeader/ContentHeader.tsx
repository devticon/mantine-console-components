import type { GroupProps, TitleOrder, TitleSize } from '@mantine/core';
import { Anchor, Breadcrumbs, Group, Title } from '@mantine/core';
import { Link } from '@remix-run/react';
import type { FC, ReactNode } from 'react';
import { TbChevronRight } from 'react-icons/tb';

type Props = GroupProps & {
  title: string;
  titleOrder?: TitleOrder;
  titleSize?: TitleSize;
  breadcrumbs?: { label: string; path: string }[];
  actions?: ReactNode;
};

export const ContentHeader: FC<Props> = ({
  title,
  titleOrder = 2,
  titleSize,
  breadcrumbs,
  actions,
  style,
  ...props
}) => {
  return (
    <Group gap="xl" justify="space-between" align="center" style={{ ...style, overflowX: 'auto' }} {...props}>
      {breadcrumbs?.length ? (
        <Breadcrumbs separator={<TbChevronRight />}>
          {breadcrumbs.map(({ path, label }) => (
            <Anchor
              key={path}
              fw={500}
              fz={`var(--mantine-${titleSize || 'h' + titleOrder}-font-size)`}
              lh="sm"
              component={Link}
              to={path}
              c="dimmed"
              style={{ textWrap: 'nowrap' }}
            >
              {label}
            </Anchor>
          ))}
          <Title order={titleOrder} size={titleSize} lh="sm" styles={{ root: { textWrap: 'nowrap' } }}>
            {title}
          </Title>
        </Breadcrumbs>
      ) : (
        <Title order={titleOrder} size={titleSize} lh="sm" styles={{ root: { textWrap: 'nowrap' } }}>
          {title}
        </Title>
      )}
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
};
