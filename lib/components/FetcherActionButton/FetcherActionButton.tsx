import type { ButtonProps } from '@mantine/core';
import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useFetcher } from '@remix-run/react';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect } from 'react';

type Props<T = any> = {
  modalTitle?: ReactNode;
  modalChildren?: ReactNode;
  fetcherAction: string;
  fetcherTarget?: any;
  successCallback?: (data: T) => void;
  errorCallback?: (data: T) => void;
} & ButtonProps;

export const FetcherActionButton = <T = any,>({
  modalTitle,
  modalChildren,
  fetcherAction,
  fetcherTarget,
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

  useEffect(() => {
    if (fetcher.data !== undefined) {
      if (fetcher.data?.error) {
        errorCallback?.(fetcher.data);
      } else if (!fetcher.data?.fieldErrors) {
        successCallback?.(fetcher.data);
      }
    }
  }, [errorCallback, fetcher.data, successCallback]);

  return (
    <Button {...props} onClick={modalTitle ? openConfirmModal : handleSubmit} loading={fetcher.state !== 'idle'}>
      {children}
    </Button>
  );
};
