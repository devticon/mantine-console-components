import type { AlertProps } from '@mantine/core';
import { Alert } from '@mantine/core';
import type { FC } from 'react';
import { IoAlertCircle } from 'react-icons/io5';

export const ErrorAlert: FC<AlertProps> = ({ children, ...props }) => {
  return (
    <Alert icon={<IoAlertCircle size="1rem" />} color="red" {...props}>
      {children}
    </Alert>
  );
};
