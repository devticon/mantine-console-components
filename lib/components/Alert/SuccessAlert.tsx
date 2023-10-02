import { Alert, AlertProps } from '@mantine/core';
import { FC } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';

export const SuccessAlert: FC<AlertProps> = ({ children, ...props }) => {
  return (
    <Alert icon={<IoCheckmarkCircle size="1rem" />} color="green" {...props}>
      {children}
    </Alert>
  );
};
