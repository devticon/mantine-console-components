import { Button, Center, Container, Text, Title } from '@mantine/core';
import { useLocation } from '@remix-run/react';
import type { FC } from 'react';

type Props = {
  errorCode: string | number;
};

export const ErrorCard: FC<Props> = ({ errorCode }) => {
  const location = useLocation();

  return (
    <Center mih="100vh" bg="dark">
      <Container py="xl" ta="center" size="xs">
        <Text fw="bold" c="blue.4" fz={220} lh={1} mb="lg">
          {errorCode}
        </Text>
        {errorCode === 404 ? (
          <>
            <Title c="white" size="h1" mb="lg">
              Nothing to see here
            </Title>
            <Text size="lg" mb="xl" c="blue.1">
              Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved
              to another URL. If you think this is an error contact support.
            </Text>
            <Button color="blue" size="lg" component="a" href="/">
              Back to home page
            </Button>
          </>
        ) : (
          <>
            <Title c="white" size="h1" mb="lg">
              Something bad just happened...
            </Title>
            <Text size="lg" mb="xl" c="blue.1">
              An unexpected server error has occurred! Please try refreshing the page, or contact the administrator if
              the problem persists.
            </Text>
            <Button color="blue" size="lg" component="a" href={location.pathname}>
              Refresh page
            </Button>
          </>
        )}
      </Container>
    </Center>
  );
};
