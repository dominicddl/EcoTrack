import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }
    const listener = () => setMatches(mediaQueryList.matches);
    mediaQueryList.addListener(listener);
    return () => mediaQueryList.removeListener(listener);
  }, [query, matches]);
  return matches;
}
