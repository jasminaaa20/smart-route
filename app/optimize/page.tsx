"use client"

import { useState, useEffect } from "react"
import { LocationInputPanel } from "@/components/location-input-panel"
import { RouteResults } from "@/components/route-results"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"

export interface Waypoint {
  id: string
  address: string
  lat: number
  lng: number
}

export interface RouteData {
  distance: string
  duration: string
  polyline: string
  optimizedOrder: number[]
}

export default function OptimizePage() {
  const [origin, setOrigin] = useState<Waypoint | null>(null)
  const [destination, setDestination] = useState<Waypoint | null>(null)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedOptimizer")
    if (!hasVisited) {
      setShowFirstTimeModal(true)
      localStorage.setItem("hasVisitedOptimizer", "true")
    }

    const savedData = localStorage.getItem("routeOptimizerData")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.origin) setOrigin(parsed.origin)
        if (parsed.destination) setDestination(parsed.destination)
        if (parsed.waypoints) setWaypoints(parsed.waypoints)
      } catch (e) {
        console.error("Failed to load saved data:", e)
      }
    }
  }, [])

  useEffect(() => {
    const dataToSave = { origin, destination, waypoints }
    localStorage.setItem("routeOptimizerData", JSON.stringify(dataToSave))
  }, [origin, destination, waypoints])

  const addWaypoint = (waypoint: Waypoint) => {
    setWaypoints((prev) => [...prev, waypoint])
  }

  const removeWaypoint = (id: string) => {
    setWaypoints((prev) => prev.filter((w) => w.id !== id))
  }

  const optimizeRoute = async () => {
    if (!origin) {
      setError("Please select an origin location")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/compute-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, waypoints }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Request failed")

      const route = json.routes[0]
      const optimizedOrder: number[] = route.optimizedIntermediateWaypointIndex || []

      setRouteData({
        distance: `${(route.distanceMeters / 1000).toFixed(1)} km`,
        duration: `${Math.round(route.duration.seconds / 60)} mins`,
        polyline: route.polyline.encodedPolyline,
        optimizedOrder,
      })
    } catch (err: any) {
        setError(`Failed to optimize route: ${err.message || "Unknown error"}`)
      } finally {
      setIsLoading(false)
    }
  }

  const startJourney = () => {
    if (!origin) return

    // Reorder waypoints based on optimization
    const orderedWaypoints =
      routeData?.optimizedOrder.map((i) => waypoints[i]) || waypoints

    let url = `https://www.google.com/maps/dir/${origin.lat},${origin.lng}`

    orderedWaypoints.forEach((wp) => {
      url += `/${wp.lat},${wp.lng}`
    })

    if (destination) {
      url += `/${destination.lat},${destination.lng}`
    }

    window.open(url, "_blank")
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Route Optimizer</h1>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        <div
          className={`
          w-full lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
          lg:relative absolute bottom-0 left-0 right-0 z-10
          transition-transform duration-300 ease-in-out
          ${isPanelCollapsed ? "translate-y-[calc(100%-3rem)]" : "translate-y-0"}
        `}
        >
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden w-full py-2 border-b border-gray-200 dark:border-gray-700"
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          >
            {isPanelCollapsed ? <ChevronUp /> : <ChevronDown />}
            <span className="ml-2">{isPanelCollapsed ? "Show Controls" : "Hide Controls"}</span>
          </Button>

          <div className="p-4 space-y-4 max-h-[70vh] lg:max-h-none overflow-y-auto">
            <LocationInputPanel
              origin={origin}
              destination={destination}
              waypoints={waypoints}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onAddWaypoint={addWaypoint}
              onRemoveWaypoint={removeWaypoint}
            />

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Button onClick={optimizeRoute} disabled={!origin || isLoading} className="w-full" size="lg">
              {isLoading ? "Optimizing..." : "Optimize Route"}
            </Button>

            {routeData && <RouteResults routeData={routeData} onStartJourney={startJourney} />}
          </div>
        </div>
      </div>

      {showFirstTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Welcome to Route Optimizer!</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>• Enter your starting location in the Origin field</p>
              <p>• Add waypoints by typing addresses</p>
              <p>• Click "Optimize Route" to find the best path</p>
              <p>• Use "Start Journey" to open in Google Maps</p>
            </div>
            <Button onClick={() => setShowFirstTimeModal(false)} className="w-full mt-6">
              Got it!
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
