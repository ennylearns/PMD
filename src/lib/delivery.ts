export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const SUPPORTED_CITIES_BY_STATE: Record<string, string[]> = {
  Abia: ["Umuahia"],
  Adamawa: ["Yola"],
  "Akwa Ibom": ["Uyo"],
  Anambra: ["Awka"],
  Bauchi: ["Bauchi"],
  Bayelsa: ["Yenagoa"],
  Benue: ["Makurdi"],
  Borno: ["Maiduguri"],
  "Cross River": ["Calabar"],
  Delta: ["Asaba"],
  Ebonyi: ["Abakaliki"],
  Edo: ["Benin City"],
  Ekiti: ["Ado Ekiti"],
  Enugu: ["Enugu"],
  FCT: ["Abuja"],
  Gombe: ["Gombe"],
  Imo: ["Owerri"],
  Jigawa: ["Dutse"],
  Kaduna: ["Kaduna"],
  Kano: ["Kano"],
  Katsina: ["Katsina"],
  Kebbi: ["Birnin Kebbi"],
  Kogi: ["Lokoja"],
  Kwara: ["Ilorin"],
  Lagos: ["Lagos", "Ikeja", "Lekki", "Victoria Island", "Yaba"],
  Nasarawa: ["Lafia"],
  Niger: ["Minna"],
  Ogun: ["Abeokuta"],
  Ondo: ["Akure"],
  Osun: ["Osogbo"],
  Oyo: ["Ibadan"],
  Plateau: ["Jos"],
  Rivers: ["Port Harcourt"],
  Sokoto: ["Sokoto"],
  Taraba: ["Jalingo"],
  Yobe: ["Damaturu"],
  Zamfara: ["Gusau"],
};

const NEARBY_NORTH_CENTRAL_STATES = new Set([
  "Benue",
  "Kogi",
  "Kwara",
  "Nasarawa",
  "Niger",
  "FCT",
]);

const METRO_HIGH_VOLUME_STATES = new Set(["Lagos", "Rivers", "Kano"]);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function findSupportedState(state: string) {
  const normalizedState = normalize(state);
  return (
    NIGERIAN_STATES.find((supportedState) => normalize(supportedState) === normalizedState) ??
    null
  );
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSupportedCities(state: string) {
  const supportedState = findSupportedState(state);
  if (!supportedState) return [];
  return SUPPORTED_CITIES_BY_STATE[supportedState] ?? [];
}

export function isSupportedDeliveryLocation(state: string, city: string) {
  const supportedCities = getSupportedCities(state);
  const normalizedCity = normalize(city);
  return supportedCities.some((supportedCity) => normalize(supportedCity) === normalizedCity);
}

export function getDeliveryFee({
  state,
}: {
  state: string;
  city?: string;
}): number | null {
  const supportedState = findSupportedState(state);
  if (!supportedState) return null;

  if (supportedState === "Plateau") return 2000;
  if (NEARBY_NORTH_CENTRAL_STATES.has(supportedState)) return 3500;
  if (METRO_HIGH_VOLUME_STATES.has(supportedState)) return 5000;
  return 6500;
}
