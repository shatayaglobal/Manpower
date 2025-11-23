"use client";

import { useState } from "react";
import {
  MapPin,
  Save,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Business } from "@/lib/business-types";
import { AddressAutocomplete } from "./address-auto-complete";

interface WorkplaceLocationSettingsProps {
  business: Business;
  onUpdate: (data: BusinessUpdateData) => Promise<void>;
}

interface BusinessUpdateData {
  address: string;
  city: string;
  country: string;
  postal_code: string;
  workplace_latitude: number | null;
  workplace_longitude: number | null;
  clock_in_radius_meters: number;
  require_location_for_clock_in: boolean;
}

export function WorkplaceLocationSettings({
  business,
  onUpdate,
}: WorkplaceLocationSettingsProps) {
  const [formData, setFormData] = useState({
    address: business?.address || "",
    city: business?.city || "",
    country: business?.country || "",
    postal_code: business?.postal_code || "",
    latitude: business?.workplace_latitude?.toString() || "",
    longitude: business?.workplace_longitude?.toString() || "",
    radius: business?.clock_in_radius_meters?.toString() || "100",
    requireLocation: business?.require_location_for_clock_in ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        } else {
          reject(new Error("Geolocation is not supported"));
        }
      });

      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));

      if (window.google?.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat: latitude, lng: longitude };

        geocoder.geocode(
          { location: latlng },
          (
            results: google.maps.GeocoderResult[] | null,
            status: google.maps.GeocoderStatus
          ) => {
            if (status === "OK" && results && results[0]) {
              const place = results[0];

              const address = place.formatted_address || "";
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

              setFormData({
                ...formData,
                address,
                city: city || formData.city,
                country: country || formData.country,
                postal_code: postal_code || formData.postal_code,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              });

              toast.success("Location and address captured successfully");
            } else {
              setFormData({
                ...formData,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              });
              toast.success("Location captured. Please type the address to confirm.");
            }
            setGettingLocation(false);
          }
        );
      } else {
        setFormData({
          ...formData,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });
        toast.warning("Coordinates set. Please type the address manually.");
        setGettingLocation(false);
      }
    } catch (error) {
      setGettingLocation(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to get location";
      toast.error("Failed to get location: " + errorMessage);
    }
  };

  const handleSave = async () => {
    if (formData.requireLocation && (!formData.latitude || !formData.longitude)) {
      toast.error("Please set workplace coordinates");
      return;
    }

    setSaving(true);
    try {
      await onUpdate({
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postal_code: formData.postal_code,
        workplace_latitude: formData.latitude
          ? parseFloat(parseFloat(formData.latitude).toFixed(6))
          : null,
        workplace_longitude: formData.longitude
          ? parseFloat(parseFloat(formData.longitude).toFixed(6))
          : null,
        clock_in_radius_meters: parseInt(formData.radius),
        require_location_for_clock_in: formData.requireLocation,
      });

      toast.success("Workplace location settings updated");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Workplace Location Settings
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {!isExpanded && (
        <div className="mt-3">
          {formData.requireLocation && formData.latitude && formData.longitude ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Location Tracking Enabled
            </span>
          ) : formData.requireLocation ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <MapPin className="w-3 h-3 mr-1" />
              Location Required - Not Configured
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Location Tracking Disabled
            </span>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 sm:space-y-6 mt-6">
          {/* Require Location Toggle */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                Require Location for Clock-In
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Workers must be at workplace to clock in
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireLocation}
                onChange={(e) =>
                  setFormData({ ...formData, requireLocation: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.requireLocation && (
            <>
              {/* Address Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workplace Address *
                </label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(address) => setFormData({ ...formData, address })}
                  onPlaceSelected={(place) => {
                    setFormData({
                      ...formData,
                      address: place.address,
                      city: place.city,
                      country: place.country,
                      postal_code: place.postal_code || formData.postal_code,
                      latitude: place.latitude.toString(),
                      longitude: place.longitude.toString(),
                    });
                  }}
                  placeholder="Type to search for your workplace address..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start typing your workplace address to search
                </p>
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Kampala"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Uganda"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workplace Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="0.321126"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workplace Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="32.591053"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clock-In Radius (meters)
                </label>
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  placeholder="100"
                  min="10"
                  max="1000"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Workers must be within this radius to clock in (recommended: 50-200m)
                </p>
              </div>

              {/* Location Summary + Google Maps Link */}
              {formData.latitude && formData.longitude && (
                <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 font-medium mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Workplace Location Set
                  </p>
                  {formData.address && (
                    <p className="text-xs text-green-700 mb-1">Address: {formData.address}</p>
                  )}
                  <p className="text-xs text-green-700">
                    Coordinates: {parseFloat(formData.latitude).toFixed(6)},{" "}
                    {parseFloat(formData.longitude).toFixed(6)}
                  </p>
                  <p className="text-xs text-green-700">
                    Radius: {formData.radius} meters
                  </p>

                  {/* Fixed: Proper <a> tag */}
                  <a
                    href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-green-600 hover:text-green-700 hover:underline mt-2 font-medium"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    View on Google Maps
                  </a>
                </div>
              )}

              {/* Get Current Location Button */}
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="w-full"
              >
                {gettingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Use My Current Location
                  </>
                )}
              </Button>
            </>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
