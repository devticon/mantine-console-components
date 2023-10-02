import { Alert, AlertProps } from '@mantine/core';
import { FC } from 'react';
import { IoAlertCircle } from 'react-icons/io5';

export const ErrorAlert: FC<AlertProps> = ({ children, ...props }) => {
  return (
    <Alert icon={<IoAlertCircle size="1rem" />} color="red" {...props}>
      {children}
    </Alert>
  );
};
