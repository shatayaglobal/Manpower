"use client";

import { useRef, useEffect, useState } from "react";
import { MapPin, Loader2, Search, Navigation } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelected: (place: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    postal_code?: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

interface Prediction {
  description: string;
  place_id: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Search for your business address...",
  className = "",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    const checkGoogleMaps = setInterval(() => {
      if (window.google?.maps?.places) {
        setIsReady(true);
        autocompleteService.current =
          new window.google.maps.places.AutocompleteService();
        const dummyDiv = document.createElement("div");
        placesService.current = new window.google.maps.places.PlacesService(
          dummyDiv
        );
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    if (!inputValue.trim() || !autocompleteService.current) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    autocompleteService.current.getPlacePredictions(
      {
        input: inputValue,
        types: ["geocode"],
      },
      (
        predictions: google.maps.places.AutocompletePrediction[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        setIsLoading(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setPredictions(predictions);
          setShowDropdown(true);
        } else {
          setPredictions([]);
          setShowDropdown(false);
        }
      }
    );
  };

  const selectPlace = (placeId: string, description: string) => {
    if (!placesService.current) return;

    setIsLoading(true);
    setShowDropdown(false);

    placesService.current.getDetails(
      {
        placeId,
        fields: ["address_components", "formatted_address", "geometry", "name"],
      },
      (
        place: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        setIsLoading(false);

        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place
        ) {
          return;
        }

        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const address = place.formatted_address || description;
        let city = "";
        let country = "";
        let postal_code = "";

        place.address_components?.forEach(
          (component: google.maps.GeocoderAddressComponent) => {
            const types = component.types;

            if (types.includes("locality")) {
              city = component.long_name;
            } else if (types.includes("administrative_area_level_1") && !city) {
              city = component.long_name;
            }

            if (types.includes("country")) {
              country = component.long_name;
            }

            if (types.includes("postal_code")) {
              postal_code = component.long_name;
            }
          }
        );

        const placeData = {
          address,
          city,
          country,
          latitude: Number(place.geometry.location.lat().toFixed(6)),
          longitude: Number(place.geometry.location.lng().toFixed(6)),
          postal_code,
        };

        onChange(address);
        onPlaceSelected(placeData);
        setPredictions([]);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          selectPlace(
            predictions[selectedIndex].place_id,
            predictions[selectedIndex].description
          );
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setPredictions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isReady ? placeholder : "Loading Google Maps..."}
          disabled={!isReady}
          className={`w-full px-4 py-2.5 pl-11 pr-11 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            placeholder:text-gray-400
            ${className}`}
        />

        {/* Left Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Right Icon - Location indicator when place is selected */}
        {value && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              onClick={() =>
                selectPlace(prediction.place_id, prediction.description)
              }
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors
                flex items-start gap-3 border-b border-gray-100 last:border-b-0
                ${selectedIndex === index ? "bg-blue-50" : ""}
              `}
            >
              <Navigation className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">
                  {prediction.description.split(",")[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {prediction.description.split(",").slice(1).join(",")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown &&
        predictions.length === 0 &&
        value.trim() &&
        !isLoading && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              No addresses found. Try a different search term.
            </p>
          </div>
        )}
    </div>
  );
}
