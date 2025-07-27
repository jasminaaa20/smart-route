// app/api/compute-route/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    return NextResponse.json({ error: "Missing Google Maps API key" }, { status: 500 })
  }

  try {
    const { origin, destination, waypoints } = await req.json()

    if (!origin || !origin.lat || !origin.lng) {
      return NextResponse.json({ error: "Origin is required and must include lat/lng" }, { status: 400 })
    }

    const intermediates =
      Array.isArray(waypoints) && waypoints.length > 0
        ? waypoints.map((w: any) => ({
            location: { latLng: { latitude: w.lat, longitude: w.lng } },
          }))
        : []

    const requestBody = {
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
      },
      destination: destination
        ? {
            location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
          }
        : {
            location: { latLng: { latitude: origin.lat, longitude: origin.lng } }, // fallback to round-trip
          },
      intermediates,
      travelMode: "DRIVE",
      optimizeWaypointOrder: true,
    }

    const queryParams = new URLSearchParams({ key })

    const response = await fetch(
      `https://routes.googleapis.com/directions/v2:computeRoutes?${queryParams.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "routes.optimizedIntermediateWaypointIndex,routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
        },
        body: JSON.stringify(requestBody),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("Google Routes API Error:", data)
      return NextResponse.json({ error: data?.error?.message || "Routes API failed" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Unexpected Error:", err)
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}
