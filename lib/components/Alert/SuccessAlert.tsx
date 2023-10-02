import type { AlertProps } from '@mantine/core';
import { Alert } from '@mantine/core';
import type { FC } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';

export const SuccessAlert: FC<AlertProps> = ({ children, ...props }) => {
  return (
    <Alert icon={<IoCheckmarkCircle size="1rem" />} color="green" {...props}>
      {children}
    </Alert>
  );
};
