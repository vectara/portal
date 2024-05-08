import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, Text, Tooltip } from "@chakra-ui/react";

export const PortalHeader = ({
  name,
  type,
}: {
  name: string;
  type: string;
}) => {
  return (
    <Heading
      size="md"
      fontFamily="Montserrat"
      width="100%"
      paddingBottom=".5rem"
      borderBottom="1px solid #888"
      fontWeight={400}
    >
      <Flex gap=".5rem" alignItems="center">
        <Text>{name}</Text>
        <Tooltip
          label={<PortalInfoToolip type={type} />}
          hasArrow
          backgroundColor="#444"
          borderRadius=".25rem"
          padding=".5rem"
          placement="auto-start"
        >
          <InfoOutlineIcon boxSize=".8rem" />
        </Tooltip>
      </Flex>
    </Heading>
  );
};

export const PortalInfoToolip = ({ type }: { type: string }) => {
  return (
    <Box>
      <Box border="1px solid #888" borderRadius=".25rem" padding=".5rem">
        Type: {type}
      </Box>
    </Box>
  );
};
