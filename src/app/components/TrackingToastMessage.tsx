import {useToast} from "@chakra-ui/react";
import React, { useEffect } from 'react';
import { Button, Box, VStack, Text } from '@chakra-ui/react';

const TrackingPreference = () => {
  const toast = useToast();

  const handleUserChoice = (allowTracking: boolean) => {
    localStorage.setItem('VECTARA_PORTAL_ALLOW_TRACKING', JSON.stringify(allowTracking));
    toast.closeAll();
  };

  useEffect(() => {
    const savedPreference = localStorage.getItem('VECTARA_PORTAL_ALLOW_TRACKING');

    if (!savedPreference) {
      toast({
        position: 'bottom-right',
        duration: null,
        isClosable: false,
        render: (): React.ReactNode => (
          <Box color="white" p={3} bg="blue.500" borderRadius="md">
            <VStack align="start" spacing={2}>
            <Text>Do you want to enable tracking?</Text>
            <Box>
            <Button colorScheme="green" mr={3} onClick={() => handleUserChoice(true)}>
            Yes
            </Button>
            <Button colorScheme="red" onClick={() => handleUserChoice(false)}>
            No
            </Button>
            </Box>
          </VStack>
        </Box>
    ),
      });
    }
  }, [toast]);

  return null;
};

export default TrackingPreference;
