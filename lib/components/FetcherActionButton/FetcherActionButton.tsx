import type { ActionIconProps, ButtonProps, ModalProps } from '@mantine/core';
import { ActionIcon, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useFetcher } from 'react-router';
import { omit } from 'lodash-es';
import type { MouseEvent, ReactElement, ReactNode, Ref } from 'react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcherNotification } from '../../utils/notifications';

type IconButtonType = {
  buttonType: 'icon';
} & ActionIconProps;

type DefaultButtonType = {
  buttonType?: 'default';
} & ButtonProps;

export type Props<T = any> = {
  modalTitle?: ReactNode;
  modalChildren?: ReactNode;
  modalProps?: Partial<ModalProps>;
  fetcherAction: string;
  fetcherTarget?: any;
  successMessage?: string;
  successCallback?: (data: T) => void;
  errorCallback?: (data: T) => void;
} & (IconButtonType | DefaultButtonType);

type FetcherActionButtonType = <T = any>(props: Props<T> & { ref?: Ref<HTMLButtonElement> }) => ReactElement;

// @ts-ignore
export const FetcherActionButton: FetcherActionButtonType = forwardRef<HTMLButtonElement, Props>(
  (
    {
      modalTitle,
      modalChildren,
      modalProps,
      fetcherAction,
      fetcherTarget,
      successMessage,
      successCallback,
      errorCallback,
      children,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation('mantine-console-components');
    const fetcher = useFetcher<any>();

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
        labels: { confirm: t('FetcherActionButton.confirm'), cancel: t('FetcherActionButton.cancel') },
        centered: true,
        onConfirm: handleSubmit,
        ...modalProps,
      });
    };

    const handleClick = modalTitle ? openConfirmModal : handleSubmit;

    useFetcherNotification(fetcher, {
      successMessage,
      successCallback,
      errorCallback,
    });

    return props.buttonType === 'icon' ? (
      <ActionIcon ref={ref} {...omit(props, 'buttonType')} onClick={handleClick} loading={fetcher.state !== 'idle'}>
        {children}
      </ActionIcon>
    ) : (
      <Button ref={ref} {...omit(props, 'buttonType')} onClick={handleClick} loading={fetcher.state !== 'idle'}>
        {children}
      </Button>
    );
  },
);
