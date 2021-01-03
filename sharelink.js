import { GetServiceAddress } from "./utils.js";

const uriKey = "uri";
const fovKey = "fov";
const latKey = "lat";
const lonKey = "lon";

export const toShareLink = (uri, cameraProps) => {
  try {
    const variables = [];

    variables.push(`${fovKey}=${cameraProps.fov}`);
    variables.push(`${latKey}=${cameraProps.lat}`);
    variables.push(`${lonKey}=${cameraProps.lon}`);
    variables.push(`${uriKey}=${uri}`);//always at end

    return `${window.location.origin}?ver=1&${variables.join("&")}`;
  } catch {
    return "";
  }
};

const asTextOrEmpty = (val) => {
  if (typeof val !== "string")
    return "";
  return val;
}

const asNumberOrNull = (val, min, max) => {
  let retValue = parseFloat(val);
  if (isNaN(retValue))
    retValue = null;
  else
    if (typeof max !== "undefined" && retValue > max)
      return max
    else
      if (typeof min !== "undefined" && retValue < min)
        return min;
  return retValue;
}

export const fromShareLink = (link) => {
  try {
    if (link) {
      const urlParams = new URLSearchParams(link);
      return {
        uri: asTextOrEmpty(urlParams.get(uriKey)),
        lat: asNumberOrNull(urlParams.get(latKey)),
        lon: asNumberOrNull(urlParams.get(lonKey)),
        fov: asNumberOrNull(urlParams.get(fovKey),10,75),
      };
    }
  } catch { }

  return null;
};
