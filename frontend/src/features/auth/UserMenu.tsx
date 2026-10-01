import {
  Box,
  Button,
  createIcon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "../../app/AuthProvider";

const ChevronDownIcon = createIcon({
  displayName: "ChevronDownIcon",
  viewBox: "0 0 24 24",
  path: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 9l6 6 6-6"
    />
  ),
});

// Door with an arrow leaving it. Drawn for LTR (arrow pointing right), so it is
// mirrored below to point outward in RTL.
const LogoutIcon = createIcon({
  displayName: "LogoutIcon",
  viewBox: "0 0 24 24",
  path: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
    />
  ),
});

function Greeting({ name }: { name: string }) {
  return (
    <>
      היי, <bdi>{name}</bdi>{" "}
      <Box as="span" aria-hidden="true">
        👋
      </Box>
    </>
  );
}

/** Header account control: a greeting that opens a small menu with logout. */
export function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <Menu placement="bottom-end" autoSelect={false}>
      {/* Colors are explicit (like the rest of the app) so the control stays
          readable even if Chakra is in dark color mode. */}
      <MenuButton
        as={Button}
        size="sm"
        variant="outline"
        bg="whiteAlpha.800"
        color="#2C1810"
        borderWidth="2px"
        borderColor="brand.300"
        fontWeight="semibold"
        _hover={{ bg: "white", borderColor: "brand.400" }}
        _active={{ bg: "white", borderColor: "brand.500" }}
        maxW={{ base: "220px", md: "280px" }}
        rightIcon={<ChevronDownIcon boxSize={4} />}
      >
        <Text as="span" display="block" noOfLines={1}>
          <Greeting name={user.displayName} />
        </Text>
      </MenuButton>
      <MenuList minW="140px" py={1} bg="white" borderWidth={0} borderRadius="lg" shadow="lg">
        <MenuItem
          icon={<LogoutIcon boxSize={4} transform="scaleX(-1)" />}
          fontSize="sm"
          fontWeight="medium"
          bg="white"
          color="gray.800"
          _hover={{ bg: "brand.100" }}
          _focus={{ bg: "brand.100" }}
          onClick={() => void logout()}
        >
          יציאה
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
