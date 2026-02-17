"use client";

import { LoadScript } from "@react-google-maps/api";

export function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key missing!");
    return <>{children}</>;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={["places"]}
    >
      {children}
    </LoadScript>
  );
}
