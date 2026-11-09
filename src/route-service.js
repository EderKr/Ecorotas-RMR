const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function calculateRoute({ origin, destination, travelMode }) {
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const requestBody = {
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: travelMode,
        computeAlternativeRoutes: false,
        languageCode: "pt-BR",
        units: "METRIC"
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error('Falha ao calcular rota com Google Routes API');
    }

    return await response.json();
}

module.exports = { calculateRoute };
