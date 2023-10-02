import { Group, MultiSelect, NumberInput, Select, Switch, TextInput } from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import type { ComponentProps } from 'react';
import type { IconType } from 'react-icons';
import invariant from 'tiny-invariant';
import { parseDate } from '../../utils/date';
import type { BaseFilters } from './utils';

export type Props<F extends BaseFilters> = {
  name: string;
  alwaysOn?: boolean;
  Icon?: IconType;
  value?: F;
  onChange?: (filters: Partial<F>, debounce?: boolean) => void;
} & (
  | ({ type: 'text' } & Omit<ComponentProps<typeof TextInput>, 'value' | 'onChange'>)
  | ({ type: 'select' } & Omit<ComponentProps<typeof Select>, 'value' | 'onChange'>)
  | ({ type: 'switch' } & Omit<ComponentProps<typeof Switch>, 'value' | 'onChange'>)
  | ({ type: 'multi-select' } & Omit<ComponentProps<typeof MultiSelect>, 'value' | 'onChange'>)
  | ({ type: 'date' } & Omit<ComponentProps<typeof DatePickerInput<'default'>>, 'value' | 'onChange' | 'type'>)
  | ({ type: 'date-time' } & Omit<ComponentProps<typeof DateTimePicker>, 'value' | 'onChange'>)
  | ({ type: 'date-range' } & Omit<ComponentProps<typeof DatePickerInput<'range'>>, 'value' | 'onChange' | 'type'>)
  | ({ type: 'range' } & Omit<ComponentProps<typeof NumberInput>, 'value' | 'onChange' | 'type'>)
);

export const TableFilter = <F extends BaseFilters>({ value: filters, onChange, ...props }: Props<F>) => {
  invariant(filters, '`filters` is required');
  invariant(onChange, '`onChange` is required');

  if (props.type === 'text') {
    return (
      <TextInput
        {...props}
        value={(filters[props.name as keyof F] as string) || ''}
        onChange={event => onChange({ [props.name]: event.currentTarget.value } as Partial<F>)}
      />
    );
  }

  if (props.type === 'select') {
    return (
      <Select
        {...props}
        checkIconPosition="right"
        clearable
        value={(filters[props.name as keyof F] as string) || ''}
        onChange={value => onChange({ [props.name]: value } as Partial<F>)}
      />
    );
  }

  if (props.type === 'switch') {
    return (
      <Switch
        {...props}
        checked={(filters[props.name as keyof F] as boolean) || false}
        onChange={event => onChange({ [props.name]: event.currentTarget.checked } as Partial<F>)}
      />
    );
  }

  if (props.type === 'multi-select') {
    return (
      <MultiSelect
        {...props}
        checkIconPosition="right"
        hidePickedOptions
        clearable
        value={(filters[props.name as keyof F] as string[]) || []}
        onChange={value => onChange({ [props.name]: value } as Partial<F>)}
      />
    );
  }

  if (props.type === 'date') {
    return (
      <DatePickerInput
        {...props}
        type="default"
        clearable
        value={parseDate(filters[props.name as keyof F] as string)}
        onChange={value => onChange({ [props.name]: value?.toISOString() || null } as Partial<F>)}
      />
    );
  }

  if (props.type === 'date-time') {
    return (
      <DateTimePicker
        {...props}
        clearable
        value={parseDate(filters[props.name as keyof F] as string)}
        onChange={value => onChange({ [props.name]: value?.toISOString() || null } as Partial<F>)}
      />
    );
  }

  if (props.type === 'date-range') {
    return (
      <DatePickerInput
        {...props}
        type="range"
        clearable
        allowSingleDateInRange
        value={[
          parseDate(filters[`${props.name}From` as keyof F] as string),
          parseDate(filters[`${props.name}To` as keyof F] as string),
        ]}
        onChange={([from, to]) =>
          onChange({
            [`${props.name}From`]: from?.toISOString() || null,
            [`${props.name}To`]: to?.toISOString() || null,
          } as Partial<F>)
        }
      />
    );
  }

  if (props.type === 'range') {
    return (
      <Group align="flex-end">
        <NumberInput
          {...props}
          type="text"
          decimalScale={2}
          decimalSeparator=","
          min={0.01}
          placeholder="Value from"
          value={(filters[`${props.name}From` as keyof F] as number) || ''}
          onChange={value => onChange({ [`${props.name}From`]: value || null } as Partial<F>)}
          hideControls
        />
        <NumberInput
          {...props}
          label={undefined}
          type="text"
          decimalScale={2}
          decimalSeparator=","
          min={0.01}
          placeholder="Value to"
          value={(filters[`${props.name}To` as keyof F] as number) || ''}
          onChange={value => onChange({ [`${props.name}To`]: value || null } as Partial<F>)}
          hideControls
        />
      </Group>
    );
    // const { type, ...rest } = props;
    //
    // return (
    //   <PriceRangeInputs
    //     {...rest}
    //     style={{ flex: 1 }}
    //     value={[
    //       filters?.[`${props.name}From` as keyof F] as number | undefined,
    //       filters?.[`${props.name}To` as keyof F] as number | undefined,
    //     ]}
    //     onChange={value =>
    //       onChange?.({
    //         [`${props.name}From`]: value[0] || '',
    //         [`${props.name}To`]: value[1] || '',
    //       } as Partial<F>)
    //     }
    //   />
    // );
  }
};
