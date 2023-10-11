import type { NumberInputProps } from '@mantine/core';
import { NumberInput } from '@mantine/core';
import type { FC } from 'react';

export const PriceNumberInput: FC<NumberInputProps> = props => {
  return <NumberInput decimalScale={2} decimalSeparator="," hideControls {...props} />;
};
