import { PortalData } from "@/app/types";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, Text, Tooltip } from "@chakra-ui/react";
import { Fragment, ReactNode } from "react";

export const PortalHeader = ({
  portalData,
  headerButtons,
}: {
  portalData: PortalData;
  headerButtons?: ReactNode[];
}) => {
  return (
    <>
      <Heading
        size="md"
        fontFamily="Montserrat"
        width="100%"
        paddingBottom=".5rem"
        borderBottom="1px solid #888"
        fontWeight={400}
        display="flex"
        gap="1rem"
        alignItems="center"
      >
        <Flex gap=".5rem" alignItems="center">
          <Text>{portalData.name}</Text>
          <Tooltip
            label={
              <PortalInfoToolip
                type={portalData.type}
                description={portalData.description ?? undefined}
              />
            }
            hasArrow
            backgroundColor="#444"
            borderRadius=".25rem"
            padding=".5rem"
            placement="auto-start"
          >
            <InfoOutlineIcon boxSize=".8rem" />
          </Tooltip>
        </Flex>
        <Flex justifyContent="flex-end" grow={1} gap=".25rem">
          {headerButtons?.map((button, index) => (
            <Fragment key={`header-button-${index}`}>{button}</Fragment>
          ))}
        </Flex>
      </Heading>
    </>
  );
};

export const PortalInfoToolip = ({
  type,
  description,
}: {
  type: string;
  description?: string;
}) => {
  return (
    <Box>
      <Flex
        border="1px solid #888"
        borderRadius=".25rem"
        padding=".5rem"
        direction="column"
        gap=".5rem"
        fontSize=".8rem"
      >
        <Box>
          <Text>{description}</Text>
        </Box>
        <Box>
          <Text>Type: {type}</Text>
        </Box>
      </Flex>
    </Box>
  );
};
