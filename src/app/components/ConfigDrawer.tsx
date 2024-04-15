import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  DrawerProps,
} from "@chakra-ui/react";

interface ConfigDrawerProps
  extends Pick<
    DrawerProps,
    "isOpen" | "onClose" | "finalFocusRef" | "children"
  > {
  header: string;
}

export const ConfigDrawer = ({
  isOpen,
  onClose,
  finalFocusRef,
  children,
}: ConfigDrawerProps) => {
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={finalFocusRef}
    >
      <DrawerOverlay />
      <DrawerContent
        backgroundColor={"#333"}
        borderLeft="1px solid #555"
        fontFamily="Montserrat"
      >
        <DrawerCloseButton color="#fff" />
        {children}
      </DrawerContent>
    </Drawer>
  );
};
