import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../store/useStore";
import { me } from "../lib/apiClient";

export default function AuthBootstrap({ children }) {
  const { setUser: setAuthUser, markLoggedIn } = useAuth();
  const { setUser: setStoreUser } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const user = await me().catch(() => null);

        if (user) {
          setAuthUser(user);
          setStoreUser(user);
          localStorage.setItem("user", JSON.stringify(user));
          markLoggedIn(true);
        } else {
          localStorage.removeItem("user");
          markLoggedIn(false);
        }
      } finally {
        if (mounted) setReady(true);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [setAuthUser, setStoreUser, markLoggedIn]);

  if (!ready) return null;
  return children;
}
