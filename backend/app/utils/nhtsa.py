import requests

NHTSA_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended"


def decode_vin(vin: str):
    """
    Calls the NHTSA VIN Decode API and returns normalized vehicle data.
    """
    url = f"{NHTSA_BASE_URL}/{vin}?format=json"
    response = requests.get(url, timeout=10)
    response.raise_for_status()

    results = response.json().get("Results", [])
    if not results:
        return None

    data = results[0]

    return {
        "year": int(data["ModelYear"]) if data.get("ModelYear", "").isdigit() else None,
        "make": data.get("Make") or None,
        "model": data.get("Model") or None,
        "trim": data.get("Trim") or None,
        "engine": data.get("EngineModel") or data.get("EngineConfiguration") or None,
    }
