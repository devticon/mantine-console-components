import type { AlertProps } from '@mantine/core';
import { Alert } from '@mantine/core';
import type { FC } from 'react';
import { TbInfoTriangle } from 'react-icons/tb';

export const ErrorAlert: FC<AlertProps> = ({ children, ...props }) => {
  return (
    <Alert icon={<TbInfoTriangle size="1rem" />} color="red" {...props}>
      {children}
    </Alert>
  );
};
