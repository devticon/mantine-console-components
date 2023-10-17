import type { TabsProps } from '@mantine/core';
import { Tabs } from '@mantine/core';
import { useLocation, useNavigate } from '@remix-run/react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

type Props = Omit<TabsProps, 'children'> & {
  i18nPrefix?: string;
  tabs: string[];
};

export const RemixTabs: FC<Props> = ({ tabs, i18nPrefix, ...props }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentTab = tabs.find(t => {
    if (tabs.length === 1) {
      return t[0];
    } else {
      return pathname.endsWith(`/${t}`);
    }
  });

  const onChange = (value: string | null) => {
    if (tabs.length > 1) {
      navigate(`./${value}`);
    }
  };

  return (
    <Tabs value={currentTab} onChange={onChange} {...props}>
      <Tabs.List>
        {tabs.map(tab => (
          <Tabs.Tab key={tab} value={tab}>
            {t(i18nPrefix ? `${i18nPrefix}.${tab}` : tab)}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
