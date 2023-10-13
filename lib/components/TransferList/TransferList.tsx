import type { BoxProps } from '@mantine/core';
import { ActionIcon, Box, Checkbox, Combobox, Group, Paper, TextInput, useCombobox } from '@mantine/core';
import xor from 'lodash/xor';
import type { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import type { BaseItem } from './utils';

type RenderListProps = {
  options: BaseItem[];
  onTransfer(options: BaseItem[]): void;
  type: 'forward' | 'backward';
};

const RenderList: FC<RenderListProps> = ({ options, onTransfer, type }) => {
  const { t } = useTranslation('mantine-console-components');
  const combobox = useCombobox();
  const [selected, setSelected] = useState<BaseItem[]>([]);
  const [search, setSearch] = useState('');
  const filteredItems = options.filter(item => item.name.toLowerCase().includes(search.toLowerCase().trim()));

  const handleValueSelect = (val: string) => {
    const item = options.find(i => i.id === val);
    setSelected(current => xor(current, [item!]));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
    combobox.updateSelectedOptionIndex();
  };

  const handleTransfer = () => {
    onTransfer(selected);
    setSelected([]);
  };

  const handleTransferAll = () => {
    onTransfer(filteredItems);
    setSelected([]);
  };

  return (
    <Box>
      <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
        <Combobox.EventsTarget>
          <Group wrap="nowrap" gap={4} style={{ flexDirection: type === 'forward' ? 'row' : 'row-reverse' }}>
            <TextInput
              styles={{ root: { flexGrow: 1 } }}
              placeholder={t('TransferList.searchPlaceholder')}
              value={search}
              onChange={handleSearchChange}
            />
            <ActionIcon variant="default" size={36} onClick={handleTransfer}>
              {type === 'forward' ? <TbChevronRight /> : <TbChevronLeft />}
            </ActionIcon>
            <ActionIcon variant="default" size={36} onClick={handleTransferAll}>
              {type === 'forward' ? <TbChevronsRight /> : <TbChevronsLeft />}
            </ActionIcon>
          </Group>
        </Combobox.EventsTarget>
        <Paper py="xs" mt={4} h={320} style={{ overflowY: 'auto' }}>
          <Combobox.Options>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <Combobox.Option
                  value={item.id}
                  key={item.id}
                  active={selected.includes(item)}
                  onMouseOver={() => combobox.resetSelectedOption()}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Checkbox
                      checked={selected.includes(item)}
                      onChange={() => {}}
                      aria-hidden
                      tabIndex={-1}
                      style={{ pointerEvents: 'none' }}
                    />
                    <span>{item.name}</span>
                  </Group>
                </Combobox.Option>
              ))
            ) : (
              <Combobox.Empty>{t('TransferList.empty')}</Combobox.Empty>
            )}
          </Combobox.Options>
        </Paper>
      </Combobox>
    </Box>
  );
};

type TransferListProps = BoxProps & {
  name?: string;
  value: [BaseItem[], BaseItem[]];
  onChange: Dispatch<SetStateAction<[BaseItem[], BaseItem[]]>>;
};

export const TransferList: FC<TransferListProps> = ({ name, value, onChange, ...props }) => {
  const handleTransfer = (transferFrom: number, options: BaseItem[]) => {
    onChange(current => {
      const transferTo = transferFrom === 0 ? 1 : 0;
      const transferFromData = current[transferFrom].filter(item => !options.includes(item));
      const transferToData = [...current[transferTo], ...options];
      const result = [];
      result[transferFrom] = transferFromData;
      result[transferTo] = transferToData;
      return result as [BaseItem[], BaseItem[]];
    });
  };

  return (
    <Box {...props}>
      {name && value[1].map(item => <input key={item.id} type="hidden" name={name} value={item.id} />)}
      <Group align="start" grow>
        <RenderList type="forward" options={value[0]} onTransfer={options => handleTransfer(0, options)} />
        <RenderList type="backward" options={value[1]} onTransfer={options => handleTransfer(1, options)} />
      </Group>
    </Box>
  );
};
