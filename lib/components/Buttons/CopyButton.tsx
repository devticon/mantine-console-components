import type { ActionIconProps, DefaultMantineColor } from '@mantine/core';
import { ActionIcon, CopyButton as MantineCopyButton, Tooltip } from '@mantine/core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCopy } from 'react-icons/tb';

type Props = {
  value: string;
  copyColor?: DefaultMantineColor;
  copiedColor?: DefaultMantineColor;
} & ActionIconProps;

export const CopyButton: FC<Props> = ({ value, copyColor = 'gray', copiedColor = 'green', ...props }) => {
  const { t } = useTranslation('mantine-console-components');

  return (
    <MantineCopyButton value={value}>
      {({ copied, copy }) => (
        <Tooltip label={t(`CopyButton.${copied ? 'copied' : 'copy'}`)} withArrow position="right" fz="xs">
          <ActionIcon variant="transparent" onClick={copy} color={copied ? copiedColor : copyColor} {...props}>
            <TbCopy />
          </ActionIcon>
        </Tooltip>
      )}
    </MantineCopyButton>
  );
};
