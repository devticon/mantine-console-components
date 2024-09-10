import { Button, Center, Container, Text, Title, useMantineTheme } from '@mantine/core';
import { useLocation } from '@remix-run/react';
import type { FC, ReactNode } from 'react';

type Props = {
  errorCode?: string | number;
  customContent?: ReactNode;
};

export const ErrorCard: FC<Props> = ({ errorCode, customContent }) => {
  const location = useLocation();
  const { primaryColor } = useMantineTheme();

  const defaultContent: Record<string | number, ReactNode> = {
    404: (
      <>
        <Title c="white" size="h1" mb="lg">
          Nothing to see here
        </Title>
        <Text size="lg" mb="xl" c={`${primaryColor}.1`}>
          Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to
          another URL. If you think this is an error contact support.
        </Text>
        <Button size="lg" component="a" href="/">
          Back to home page
        </Button>
      </>
    ),
    403: (
      <>
        <Title c="white" size="h1" mb="lg">
          Something bad just happened...
        </Title>
        <Text size="lg" mb="xl" c={`${primaryColor}.1`}>
          You do not have permission to access this page. If you think this is an error contact support.
        </Text>
        <Button size="lg" component="a" href="/">
          Back to home page
        </Button>
      </>
    ),
    500: (
      <>
        <Title c="white" size="h1" mb="lg">
          Something bad just happened...
        </Title>
        <Text size="lg" mb="xl" c={`${primaryColor}.1`}>
          An unexpected server error has occurred! Please try refreshing the page, or contact support if the problem
          persists.
        </Text>
        <Button size="lg" component="a" href={location.pathname}>
          Refresh page
        </Button>
      </>
    ),
  };

  return (
    <Center mih="100vh" bg="dark">
      <Container py="xl" ta="center" size="xs">
        {errorCode && (
          <Text fw="bold" c={`${primaryColor}.4`} fz={220} lh={1} mb="lg">
            {errorCode}
          </Text>
        )}
        {customContent || defaultContent[errorCode || 500] || defaultContent[500]}
      </Container>
    </Center>
  );
};
