import { Alert, Button, Center, Code, Container, Text, Title, useMantineTheme } from '@mantine/core';
import { FC, ReactNode, useMemo } from 'react';
import { isRouteErrorResponse, useLocation } from 'react-router';

type Props = {
  error?: unknown;
  isDev?: boolean;
  errorCode?: string | number;
  customContent?: ReactNode;
  defaultContentOverrides?: Record<string | number, ReactNode>;
};

export const ErrorCard: FC<Props> = ({ isDev, error, errorCode, customContent, defaultContentOverrides }) => {
  const location = useLocation();
  const { primaryColor } = useMantineTheme();

  const statusCode = useMemo(() => {
    if (errorCode) {
      return errorCode;
    }

    if (isRouteErrorResponse(error)) {
      return error.status;
    }

    return 500;
  }, [error, errorCode]);

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
    ...defaultContentOverrides,
  };

  return (
    <Center mih="100vh" bg="dark" style={{ flexDirection: 'column' }}>
      <Container py="xl" ta="center" size="xs">
        {statusCode && (
          <Text fw="bold" c={`${primaryColor}.4`} fz={220} lh={1} mb="lg">
            {statusCode}
          </Text>
        )}
        {customContent || defaultContent[statusCode || 500] || defaultContent[500]}
      </Container>
      {isDev && error instanceof Error && (
        <Container py="xl">
          <Alert color="red" variant="filled">
            {error.message}
          </Alert>
          <Code block mt="md">
            {error.stack}
          </Code>
        </Container>
      )}
    </Center>
  );
};
