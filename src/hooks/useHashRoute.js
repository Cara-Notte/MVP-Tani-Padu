import { useCallback, useEffect, useState } from "react";

function getHashRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export function useHashRoute() {
  const [route, setRoute] = useState(getHashRoute);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getHashRoute());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((path) => {
    const nextPath = path.startsWith("/") ? path : `/${path}`;

    if (getHashRoute() === nextPath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.location.hash = nextPath;
  }, []);

  return { route, navigate };
}
