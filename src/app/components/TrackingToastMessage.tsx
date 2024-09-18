import {useToast} from "@chakra-ui/react";
import React, {useEffect, useState} from 'react';
import { Box, VStack, Text, Button as ChakraButton, } from '@chakra-ui/react';
import * as amplitude from '@amplitude/analytics-browser';

const TrackingPreference = () => {
  const toast = useToast();

  const handleUserChoice = (allowTracking: boolean) => {
    localStorage.setItem('VECTARA_PORTAL_ALLOW_TRACKING', JSON.stringify(allowTracking));
    toast.closeAll();
  };

  useEffect(() => {
    const savedPreference = localStorage.getItem('VECTARA_PORTAL_ALLOW_TRACKING');

    if (savedPreference === "false") {
      amplitude.setOptOut(true)
    }

    if (!savedPreference) {
      toast({
        position: 'bottom-right',
        duration: null,
        isClosable: false,
        render: (): React.ReactNode => (
          <Box width="450px" bg="white" p={3} borderRadius="md">
            <VStack>
            <Text>This website uses analytics to enhance your experience and improve our product.
              If you prefer not to participate in this data collection, you can opt out.</Text>
            <Box display="flex" justifyContent="center">
              <ChakraButton
                width="150px"
                colorScheme="blue"
                p=".5rem 1rem"
                onClick={() => handleUserChoice(true)}
                fontSize=".75rem"
                size="md"
                mr="50px"
              >
                Allow
              </ChakraButton>
              <ChakraButton
                width="100px"
                p=".5rem 1rem"
                onClick={() => handleUserChoice(false)}
                colorScheme='blue'
                variant='outline'
                fontSize=".75rem"
              >
                Opt Out
              </ChakraButton>
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
