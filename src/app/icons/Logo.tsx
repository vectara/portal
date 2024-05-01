import { Box, Flex } from "@chakra-ui/react";

export const VectaraLogo = () => {
  return (
    <Flex style={wrapperStyles}>
      <Box style={logoStyles} />
    </Flex>
  );
};

const wrapperStyles = {
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: "50%",
  boxShadow: "inset 0px 0px 2px 1px rgba(170,170,170,1)",
  justifyContent: "center",
  padding: ".4rem",
};

const logoStyles = {
  width: "25px",
  aspectRatio: "1 / 1",
  backgroundImage: 'url("/images/vectara_logo_transparent.png")',
  backgroundPosition: "center 2px",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
};

export const VectaraLogoLarge = () => {
  return (
    <Flex style={wrapperStylesLg} className="vectara-logo-wrapper">
      <Box style={logoStylesLg} className="vectara-logo-content" />
    </Flex>
  );
};

const wrapperStylesLg = {
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  padding: "2rem",
};

const logoStylesLg = {
  width: "100px",
  aspectRatio: "1 / 1",
  backgroundImage: 'url("/images/vectara_logo_transparent.png")',
  backgroundPosition: "center .5rem",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
};
