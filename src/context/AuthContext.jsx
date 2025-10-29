// src/context/AuthContext.jsx
import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { me } from "../lib/apiClient";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [checkedOnce, setCheckedOnce] = useState(false); // finished first load
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Read/write a sticky "auth ok" flag for this tab
  const getAuthFlag = () => sessionStorage.getItem("auth_ok") === "1";
  const setAuthFlag = (v) => sessionStorage.setItem("auth_ok", v ? "1" : "0");

  // First load: try to fetch current user once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await me();                  // should return user
        if (!mounted) return;
        const role = u?.role || u?.user?.role; // support { user: {...} } or direct
        const userObj = u?.user || u;
        setUser(userObj || null);
        setIsLoggedIn(Boolean(role));
        setAuthFlag(Boolean(role));
      } catch {
        if (!mounted) return;
        setUser(null);
        setIsLoggedIn(false);
        setAuthFlag(false);
      } finally {
        if (mounted) setCheckedOnce(true);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call this after a successful login response
  const markLoggedIn = useCallback((u) => {
    const userObj = u?.user || u;
    setUser(userObj || null);
    setIsLoggedIn(true);
    setAuthFlag(true);
  }, []);

  // Call this on logout
  const markLoggedOut = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setAuthFlag(false);
  }, []);

  /**
   * Smart gate for actions that require auth.
   * - If we already know you're logged in → run the action.
   * - If unknown or previously failed → try me() once; if ok, cache and run.
   * - If not authenticated → redirect to /login?next=<current>
   */
  const requireAuth = useCallback(
    async (authedAction) => {
      // Fast path: we already know session is good
      if (isLoggedIn || getAuthFlag()) {
        if (typeof authedAction === "function") authedAction();
        return true;
      }

      // Try to resolve by calling /api/user
      try {
        const u = await me();
        const role = u?.role || u?.user?.role;
        const userObj = u?.user || u;
        if (role) {
          setUser(userObj || null);
          setIsLoggedIn(true);
          setAuthFlag(true);
          if (typeof authedAction === "function") authedAction();
          return true;
        }
      } catch {
        /* fall through */
      }

      // Not authenticated → bounce to login once
      toast.error("Please sign in to continue");
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
      return false;
    },
    [isLoggedIn, location.pathname, location.search, navigate]
  );

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      checkedOnce,
      setUser: markLoggedIn,
      logoutLocal: markLoggedOut,
      requireAuth,
    }),
    [user, isLoggedIn, checkedOnce, markLoggedIn, markLoggedOut, requireAuth]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);
