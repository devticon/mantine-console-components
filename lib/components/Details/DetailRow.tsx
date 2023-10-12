import type { GroupProps, MantineRadiusValues } from '@mantine/core';
import { Center, Group, rem, Stack, Text, useMantineTheme } from '@mantine/core';
import type { FC, ReactNode } from 'react';
import { useCallback } from 'react';
import { CopyButton } from '../Buttons/CopyButton';

type Props = GroupProps & {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  copyText?: string;
  actions?: ReactNode;
};

export const DetailRow: FC<Props> = ({ icon, label, value, copyText, actions, ...props }) => {
  const { defaultRadius, radius, primaryColor } = useMantineTheme();

  const Content = useCallback(() => {
    if (!value || typeof value === 'number' || typeof value === 'string') {
      return <Text fw={500}>{value || '-'}</Text>;
    } else {
      return value;
    }
  }, [value]);

  return (
    <Group wrap="nowrap" {...props}>
      {icon && (
        <Center
          w={rem(40)}
          h={rem(40)}
          bg={`${primaryColor}.1`}
          style={{ flexShrink: 0, borderRadius: radius[defaultRadius as keyof MantineRadiusValues] }}
        >
          {icon}
        </Center>
      )}
      <Stack gap={4} align="flex-start">
        <Text c="dimmed" inline>
          {label}
        </Text>
        <Content />
      </Stack>
      <Group ml="auto">
        {copyText && <CopyButton value={copyText} />}
        {actions}
      </Group>
    </Group>
  );
};
