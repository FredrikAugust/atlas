import React from "react";

/**
 * Technically, there's no reason to even have a context, as google will set
 * the google object on window, but I think it's cleaner to use this when
 * possible due to type safety.
 */
const APICtx = React.createContext<typeof google | null>(null);

interface IGoogleAPIProviderProps {
  apiKey: string; // This is the Google API Key you got from Google's websites
  loadingComponent: React.ReactNode;
}

/**
 * Wrap the entire application in this -- that way you will have access to the
 * google object everywhere.
 */
export const GoogleAPIProvider: React.FC<IGoogleAPIProviderProps> = props => {
  // Track if we're waiting for script element to load
  const [loading, setLoading] = React.useState(true);

  // Only perform on mount
  React.useEffect(() => {
    const el = document.createElement("script");
    el.id = "googlemapsapi-script";

    el.onload = () => {
      setLoading(false);
    };

    el.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}`;

    // Sadly, we don't have support for nullish coalescing yet, so we'll have to
    // use this ugly exist-assertion.
    document.querySelector("body")!.appendChild(el);

    return () => {
      // To prevent you from using an object that does not exist.
      setLoading(true);
      document.querySelector("#googlemapsapi-script")!.remove();
    };
  }, []);

  let renderEl: React.ReactNode | undefined;

  if (loading) {
    renderEl = props.loadingComponent;
  } else {
    renderEl = props.children;
  }

  return <APICtx.Provider value={window.google}>{renderEl}</APICtx.Provider>;
};

/**
 * You will use this to get out the google element further down the line.
 */
export const useGoogle = () => React.useContext(APICtx)!;
