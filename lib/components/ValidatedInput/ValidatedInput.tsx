import { TextInput } from '@mantine/core';
import type { Fetcher } from 'react-router';
import { useActionData } from 'react-router';
import { get } from 'lodash-es';
import type { ComponentProps, ElementType } from 'react';

type Props<C extends ElementType = typeof TextInput> = ComponentProps<C> & {
  fetcher?: Fetcher;
  component?: C;
};

export const ValidatedInput = <C extends ElementType = typeof TextInput>({
  component,
  fetcher,
  ...props
}: Props<C>) => {
  const actionData = useActionData();
  const finalData = fetcher?.data || actionData;
  const Element = component || TextInput;

  return <Element {...props} error={props.error || get(finalData?.fieldErrors, props.name)} />;
};
