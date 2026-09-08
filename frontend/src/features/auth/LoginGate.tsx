import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../../app/AuthProvider";
import { getErrorMessageFromError } from "../../utils/errorMessages";
import { ApiClientError } from "../../services/apiClient";
import logo from "../../assets/logo.png";

export function LoginGate() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof ApiClientError && err.code === "UNAUTHORIZED"
          ? "אימייל או סיסמה שגויים"
          : getErrorMessageFromError(err),
      );
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" px={4} dir="rtl">
      <Box
        w="full"
        maxW="sm"
        bg="brand.50"
        borderRadius="xl"
        borderWidth="2px"
        borderColor="gray.400"
        overflow="hidden"
      >
        <VStack spacing={2} bg="brand.200" py={6} px={6}>
          <Image src={logo} alt="המטבח של שרון" boxSize="64px" objectFit="contain" />
          <Heading size="md" color="#2C1810" textAlign="center">
            המטבח של שרון
          </Heading>
          <Text fontSize="sm" color="#2C1810">
            התחברות לניהול המלאי
          </Text>
        </VStack>

        <Box as="form" onSubmit={handleSubmit} p={6}>
          <FormControl isInvalid={Boolean(error)}>
            <FormLabel color="gray.700">אימייל</FormLabel>
            <Input
              type="email"
              dir="ltr"
              textAlign="right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="username"
              bg="white"
              color="gray.800"
              borderColor="gray.500"
              borderWidth="2px"
              _hover={{ borderColor: "gray.700" }}
              _focusVisible={{ borderColor: "gray.700", boxShadow: "none" }}
            />
          </FormControl>

          <FormControl isInvalid={Boolean(error)} mt={4}>
            <FormLabel color="gray.700">סיסמה</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              bg="white"
              color="gray.800"
              borderColor="gray.500"
              borderWidth="2px"
              _hover={{ borderColor: "gray.700" }}
              _focusVisible={{ borderColor: "gray.700", boxShadow: "none" }}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            w="full"
            mt={5}
            isLoading={submitting}
            isDisabled={!email || !password}
          >
            כניסה
          </Button>
        </Box>
      </Box>
    </Flex>
  );
}
