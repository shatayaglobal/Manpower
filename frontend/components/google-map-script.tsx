"use client";

import { useEffect } from "react";

export default function GoogleMapsScript() {
  useEffect(() => {
    if (window.google?.maps?.places) {
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.id = "google-maps-script";

    document.head.appendChild(script);
  }, []);

  return null;
}
