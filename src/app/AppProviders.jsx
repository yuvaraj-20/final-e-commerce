import { AuthProvider } from "../context/AuthContext";
import AuthBootstrap from "./AuthBootstrap";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AuthBootstrap>{children}</AuthBootstrap>
    </AuthProvider>
  );
}
