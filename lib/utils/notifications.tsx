import type { NotificationData } from '@mantine/notifications';
import { notifications } from '@mantine/notifications';
import { Fetcher, useActionData } from 'react-router';
import { useEffect } from 'react';
import { TbInfoCircle, TbInfoTriangle } from 'react-icons/tb';

export function showSuccessNotification(params: NotificationData) {
  notifications.show({ withCloseButton: true, color: 'green', icon: <TbInfoCircle />, ...params });
}

export function showErrorNotification(params: NotificationData) {
  notifications.show({ withCloseButton: true, color: 'red', icon: <TbInfoTriangle />, ...params });
}

type Params<T> = {
  errorMessage?: string;
  successMessage?: string;
  successCallback?: (data: T) => void;
  errorCallback?: (data: T) => void;
};

export function showNotificationFromData(
  data: any,
  { errorMessage, errorCallback, successMessage, successCallback }: Params<any>,
) {
  if (data !== undefined) {
    if (data?.error) {
      showErrorNotification({ message: errorMessage || data.error, autoClose: false });
      errorCallback?.(data);
    } else if (!data?.fieldErrors) {
      successMessage && showSuccessNotification({ message: successMessage });
      successCallback?.(data);
    }
  }
}

export function useFetcherNotification<T = any>(fetcher: Fetcher<T>, params: Params<T>) {
  const data = fetcher.data as any;

  useEffect(() => {
    showNotificationFromData(data, params);
  }, [data]);
}

export function useActionDataNotification<T = any>(params: Params<T>) {
  const data = useActionData<T>() as any;

  useEffect(() => {
    showNotificationFromData(data, params);
  }, [data]);
}
