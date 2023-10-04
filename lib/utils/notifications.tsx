import type { NotificationData } from '@mantine/notifications';
import { notifications } from '@mantine/notifications';
import type { Fetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { IoAlertCircle, IoCheckmarkCircle } from 'react-icons/io5';

export function showSuccessNotification(params: NotificationData) {
  notifications.show({ withCloseButton: true, color: 'green', icon: <IoCheckmarkCircle />, ...params });
}

export function showErrorNotification(params: NotificationData) {
  notifications.show({ withCloseButton: true, color: 'red', icon: <IoAlertCircle />, ...params });
}

type Params<T> = {
  successMessage?: string;
  successCallback?: (data: T) => void;
  errorCallback?: (data: T) => void;
};

export function useFetcherNotification<T = any>(
  fetcher: Fetcher<T>,
  { successMessage, successCallback, errorCallback }: Params<T>,
) {
  const data = fetcher.data as any;

  useEffect(() => {
    if (data !== undefined) {
      if (data?.error) {
        showErrorNotification({ message: data.error });
        errorCallback?.(data);
      } else if (!data?.fieldErrors) {
        successMessage && showSuccessNotification({ message: successMessage });
        successCallback?.(data);
      }
    }
  }, [data, errorCallback, successCallback, successMessage]);
}
