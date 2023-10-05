import type { ActionIconProps, ButtonProps } from '@mantine/core';
import { ActionIcon, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useFetcher } from '@remix-run/react';
import type { MouseEvent, ReactNode } from 'react';
import { useFetcherNotification } from '../../utils/notifications';

type IconButtonType = {
  buttonType: 'icon';
} & ActionIconProps;

type DefaultButtonType = {
  buttonType?: 'default';
} & ButtonProps;

type Props<T = any> = {
  modalTitle?: ReactNode;
  modalChildren?: ReactNode;
  fetcherAction: string;
  fetcherTarget?: any;
  successMessage?: string;
  successCallback?: (data: T) => void;
  errorCallback?: (data: T) => void;
} & (IconButtonType | DefaultButtonType);

export const FetcherActionButton = <T = any,>({
  modalTitle,
  modalChildren,
  fetcherAction,
  fetcherTarget,
  successMessage,
  successCallback,
  errorCallback,
  children,
  ...props
}: Props<T>) => {
  const fetcher = useFetcher();

  const handleSubmit = () => {
    fetcher.submit(fetcherTarget || null, {
      action: fetcherAction,
      method: 'POST',
    });
  };

  const openConfirmModal = (event: MouseEvent) => {
    event.preventDefault();

    modals.openConfirmModal({
      title: modalTitle,
      children: modalChildren,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      centered: true,
      onConfirm: handleSubmit,
    });
  };

  const handleClick = modalTitle ? openConfirmModal : handleSubmit;

  useFetcherNotification(fetcher, {
    successMessage,
    successCallback,
    errorCallback,
  });

  return props.buttonType === 'icon' ? (
    <ActionIcon {...props} onClick={handleClick} loading={fetcher.state !== 'idle'}>
      {children}
    </ActionIcon>
  ) : (
    <Button {...props} onClick={handleClick} loading={fetcher.state !== 'idle'}>
      {children}
    </Button>
  );
};
