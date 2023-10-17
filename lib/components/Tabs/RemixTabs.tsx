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
    return pathname.endsWith(`/${t}`) || pathname.includes(`/${t}/`);
  });

  return (
    <Tabs value={currentTab} onChange={value => navigate(`./${value}`)} {...props}>
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
