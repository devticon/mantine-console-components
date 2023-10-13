import type { AlertProps } from '@mantine/core';
import { Alert } from '@mantine/core';
import type { FC } from 'react';
import { TbInfoCircle } from 'react-icons/tb';

export const SuccessAlert: FC<AlertProps> = ({ children, ...props }) => {
  return (
    <Alert icon={<TbInfoCircle size="1rem" />} color="green" {...props}>
      {children}
    </Alert>
  );
};
