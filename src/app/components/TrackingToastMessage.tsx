import {useToast} from "@chakra-ui/react";
import React, {useEffect, useState} from 'react';
import { Box, VStack, Text, Link, Button as ChakraButton, } from '@chakra-ui/react';
import * as amplitude from '@amplitude/analytics-browser';


// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
};

// Helper function to get a cookie by name
const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};
const TrackingPreference = () => {
  const toast = useToast();

  const handleUserChoice = (allowTracking: boolean) => {
    setCookie('VECTARA_PORTAL_ALLOW_TRACKING', JSON.stringify(allowTracking), 365);
    toast.closeAll();
  };

  useEffect(() => {
    const savedPreference = getCookie('VECTARA_PORTAL_ALLOW_TRACKING');

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
            <Text>This website uses analytics to enhance your experience and improve our product. For more information, please see
              our <Link href="https://vectara.com/legal/privacy-policy/" isExternal>Privacy Policy</Link>.
              <Text mt="5px" mb="5px">If you choose to opt out, your preference will be saved, and no data will be collected during your visit.</Text>
              Your preference will be saved in a single cookie.
            </Text>
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
