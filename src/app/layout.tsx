"use client";

import "./globals.css";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { RecoilRoot } from "recoil";
import { useUser } from "./hooks/useUser";
import { Suspense, useEffect } from "react";
import { Header } from "./components/Header";
import { AmplitudeReactProvider, useAmplitude } from "amplitude-react";
import { NAVIGATE_HOME_PAGE } from "./analytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Project Portal - Vectara</title>
        <link href="/main.css" rel="stylesheet" />
      </head>
      <body>
        <ChakraProvider>
          <RecoilRoot>
            <AmplitudeReactProvider
              apiKey={process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY}
            >
              <App>{children}</App>
            </AmplitudeReactProvider>
          </RecoilRoot>
        </ChakraProvider>
      </body>
    </html>
  );
}

const App = ({ children }: { children: React.ReactNode }) => {
  const { loadCurrentUser, currentUser } = useUser();
  const { logEvent } = useAmplitude();

  if (!currentUser) {
    loadCurrentUser();
  }

  useEffect(() => {
    logEvent(NAVIGATE_HOME_PAGE);
  }, []);

  return (
    <Flex
      background="linear-gradient(180deg, hsla(0, 0%, 30%, 1) 0%, hsla(0, 0%, 20%, 1) 55%, hsla(0, 0%, 10%, 1) 100%)"
      fontFamily="Montserrat"
      direction="column"
      height="100%"
      left={0}
      overflow="auto"
      position="fixed"
      top={0}
      width="100%"
    >
      {currentUser && (
        <Suspense>
          <Header />
        </Suspense>
      )}

      {children}
    </Flex>
  );
};
