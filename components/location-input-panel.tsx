"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, MapPin } from "lucide-react"
import type { Waypoint } from "@/app/optimize/page"

declare global {
  interface Window {
    google: typeof google
  }
}

type LocationInputPanelProps = {
  origin: Waypoint | null
  destination: Waypoint | null
  waypoints: Waypoint[]
  onOriginChange: (waypoint: Waypoint) => void
  onDestinationChange: (waypoint: Waypoint) => void
  onAddWaypoint: (waypoint: Waypoint) => void
  onRemoveWaypoint: (id: string) => void
}

export function LocationInputPanel({
  origin,
  destination,
  waypoints,
  onOriginChange,
  onDestinationChange,
  onAddWaypoint,
  onRemoveWaypoint,
}: LocationInputPanelProps) {
  const [originInput, setOriginInput] = useState(origin?.address || "")
  const [destinationInput, setDestinationInput] = useState(destination?.address || "")
  const [waypointInputs, setWaypointInputs] = useState<string[]>(waypoints.map((w) => w.address))
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false)

  const originRef = useRef<HTMLInputElement>(null)
  const destinationRef = useRef<HTMLInputElement>(null)
  const waypointRefs = useRef<(HTMLInputElement | null)[]>([])
  const autocompleteRefs = useRef<google.maps.places.Autocomplete[]>([])

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      if (!window.google?.maps?.places) {
        // Wait for Google Maps to load
        const checkGoogleMaps = () => {
          if (window.google?.maps?.places) {
            initAutocomplete()
          } else {
            setTimeout(checkGoogleMaps, 100)
          }
        }
        setTimeout(checkGoogleMaps, 100)
        return
      }

      try {
        autocompleteRefs.current.forEach(autocomplete => {
          if (autocomplete) {
            google.maps.event.clearInstanceListeners(autocomplete)
          }
        })
        autocompleteRefs.current = []

        // Origin autocomplete
        if (originRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(originRef.current)
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if (place.geometry?.location) {
              const waypoint: Waypoint = {
                id: "origin",
                address: place.formatted_address || place.name || "",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }
              onOriginChange(waypoint)
              setOriginInput(waypoint.address)
            }
          })
        }

        // Destination autocomplete
        if (destinationRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(destinationRef.current)
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if (place.geometry?.location) {
              const waypoint: Waypoint = {
                id: "destination",
                address: place.formatted_address || place.name || "",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }
              onDestinationChange(waypoint)
              setDestinationInput(waypoint.address)
            }
          })
        }

        // Waypoint autocompletes - reinitialize all
        waypointRefs.current.forEach((ref, index) => {
          if (ref) {
            const autocomplete = new window.google.maps.places.Autocomplete(ref)
            autocompleteRefs.current[index] = autocomplete
            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace()
              if (place.geometry?.location) {
                const waypoint: Waypoint = {
                  id: Date.now().toString() + index,
                  address: place.formatted_address || place.name || "",
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }

                onAddWaypoint(waypoint)

                const newInputs = [...waypointInputs]
                newInputs[index] = waypoint.address
                setWaypointInputs(newInputs)
              }
            })
          }
        })
      } catch (error) {
        console.error("Failed to initialize autocomplete:", error)
      }
    }

    initAutocomplete()
  }, [waypoints, waypointInputs.length, onOriginChange, onDestinationChange, onAddWaypoint])

  const addWaypointInput = () => {
    setWaypointInputs([...waypointInputs, ""])
  }

  const removeWaypointInput = (index: number) => {
    const newInputs = waypointInputs.filter((_, i) => i !== index)
    setWaypointInputs(newInputs)

    if (waypoints[index]) {
      onRemoveWaypoint(waypoints[index].id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Origin Input */}
      <div className="space-y-2">
        <Label htmlFor="origin" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Origin *
        </Label>
        <div className="relative">
          <Input
            id="origin"
            ref={originRef}
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            placeholder="Enter starting location"
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Waypoints */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          Waypoints
        </Label>

        {waypointInputs.map((input, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={(el) => {
                  waypointRefs.current[index] = el
                }}
                value={input}
                onChange={(e) => {
                  const newInputs = [...waypointInputs]
                  newInputs[index] = e.target.value
                  setWaypointInputs(newInputs)
                }}
                placeholder={`Waypoint ${index + 1}`}
                className="pr-10"
              />
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <Button variant="outline" size="icon" onClick={() => removeWaypointInput(index)} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={addWaypointInput} className="w-full bg-transparent" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Waypoint
        </Button>
      </div>

      {/* Destination Input */}
      <div className="space-y-2">
        <Label htmlFor="destination" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          Destination (optional)
        </Label>
        <div className="relative">
          <Input
            id="destination"
            ref={destinationRef}
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            placeholder="Enter destination (or return to origin)"
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {isLoadingAutocomplete && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Loading suggestions...</div>
      )}
    </div>
  )
}
