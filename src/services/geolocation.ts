import {
  getCurrentPosition,
  requestPermission,
  setConfiguration,
  type GeolocationResponse,
  type LocationRequestOptions,
  type PermissionStatus,
} from "react-native-nitro-geolocation";

setConfiguration({
  authorizationLevel: "whenInUse",
  enableBackgroundLocationUpdates: false,
  locationProvider: "auto",
});

const defaultLocationOptions: LocationRequestOptions = {
  accuracy: { android: "high", ios: "best" },
  timeout: 15_000,
};

async function requestLocationPermission(): Promise<PermissionStatus> {
  return requestPermission();
}

async function getCurrentLocation(
  options: LocationRequestOptions = defaultLocationOptions,
): Promise<GeolocationResponse> {
  return getCurrentPosition(options);
}

export const GeolocationService = {
  getCurrentLocation,
  requestLocationPermission,
};
