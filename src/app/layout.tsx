"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { RecoilRoot } from "recoil";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ChakraProvider>
          <RecoilRoot>{children}</RecoilRoot>
        </ChakraProvider>
      </body>
    </html>
  );
}
