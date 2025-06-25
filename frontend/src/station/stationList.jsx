"use client"

import { useState, useEffect } from "react"
import AddStation from "./addStation"
import PopUp from "./popup"

const StationList = () => {
  // State management
  const [stationsData, setStationsData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortFilter, setSortFilter] = useState("newest")
  const [showMap, setShowMap] = useState(false)
  const [carouselStates, setCarouselStates] = useState({})
  const [searching, setSearching] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // États pour les Popups
  const [popup, setPopup] = useState({
    type: "",
    message: "",
    isVisible: false,
  })

  // Fetch stations from backend
  const fetchStations = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3000/stations/station-list")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des stations")
      }

      const data = await response.json()

      setStationsData(data.data || [])
      setFilteredData(data.data || [])
    } catch (err) {
      setError(err.message)
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  // Load stations on component mount
  useEffect(() => {
    fetchStations()
  }, [])

  const handleStationAdded = (newStation) => {
    // Ajouter la nouvelle station à la liste
    setStationsData((prev) => [newStation, ...prev])
    setFilteredData((prev) => [newStation, ...prev])
  }

  const handleSuccess = (message) => {
    setPopup({
      type: "success",
      message: message,
      isVisible: true,
    })
  }

  const handleError = (message) => {
    setPopup({
      type: "error",
      message: message,
      isVisible: true,
    })
  }

  const closePopup = () => {
    setPopup((prev) => ({
      ...prev,
      isVisible: false,
    }))
  }

  useEffect(() => {
    if (searchTerm) {
      setSearching(true)
      const timer = setTimeout(() => {
        setSearching(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [searchTerm])

  const itemsPerPage = 6

  // Apply filters and search
  useEffect(() => {
    const filtered = stationsData.filter((station) => {
      const matchesSearch =
        station.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.type_technique?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = !typeFilter || station.type_technique === typeFilter
      const matchesStatus = !statusFilter || station.statut === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })

    // Sort data
    filtered.sort((a, b) => {
      switch (sortFilter) {
        case "oldest":
          return new Date(a.date_installation) - new Date(b.date_installation)
        case "name":
          return a.nom?.localeCompare(b.nom) || 0
        case "power":
          return (b.puissance || 0) - (a.puissance || 0)
        case "newest":
        default:
          return new Date(b.date_installation) - new Date(a.date_installation)
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter, sortFilter, stationsData])

const moveCarousel = (stationId, direction) => {
  
  // Utilisez _id au lieu de id car c'est le champ dans vos données
  const station = stationsData.find((s) => s._id === stationId)
  
  if (!station) {
    console.error("Station non trouvée pour ID:", stationId)
    return
  }

  if (!station.images_secteurs || station.images_secteurs.length <= 1) {
    console.log("Pas assez d'images pour le carrousel")
    return
  }

  setCarouselStates((prev) => {
    const currentIndex = prev[stationId]?.currentIndex || 0
    let newIndex = currentIndex + direction

    // Gestion cyclique
    if (newIndex < 0) {
      newIndex = station.images_secteurs.length - 1
    } else if (newIndex >= station.images_secteurs.length) {
      newIndex = 0
    }

    return {
      ...prev,
      [stationId]: { currentIndex: newIndex }
    }
  })
}

  // Get type colors
  const getTypeColor = (type) => {
    const colors = {
      macro: "bg-blue-100 text-blue-700 border-blue-200",
      micro: "bg-green-100 text-green-700 border-green-200",
      indoor: "bg-purple-100 text-purple-700 border-purple-200",
      outdoor: "bg-orange-100 text-orange-700 border-orange-200",
    }
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  // Get status colors
  const getStatusColor = (status) => {
    const colors = {
      actif: "bg-green-100 text-green-700",
      maintenance: "bg-yellow-100 text-yellow-700",
      inactif: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  // Create carousel component
  const createCarousel = (images_secteurs, stationId) => {
  const defaultImage = "/placeholder.svg";

  if (!images_secteurs || images_secteurs.length === 0) {
    return (
      <div className="rounded-t-2xl overflow-hidden" style={{ height: "192px" }}>
        <img
          src={defaultImage || "/placeholder.svg"}
          alt="Station image par défaut"
          className="w-full h-full"
          style={{ 
            objectFit: "cover",
            backgroundColor: "#f3f4f6",
            width: "100%",
            height: "100%"
          }}
          onError={(e) => {
            e.target.src = defaultImage
          }}
        />
      </div>
    )
  }

  const currentIndex = carouselStates[stationId]?.currentIndex || 0;

  // Préparer les URLs des images
  const processedImages = images_secteurs.map((img) => {
    // Si l'image est déjà une URL complète, la garder
    if (img.startsWith("http://") || img.startsWith("https://")) {
      return img
    }
    // Sinon, ajouter le base URL
    return `http://localhost:3000${img.startsWith("/") ? img : `/${img}`}`
  })

  if (processedImages.length <= 1) {
    return (
      <div className="rounded-t-2xl overflow-hidden" style={{ height: "192px" }}>
        <img
          src={processedImages[0] || defaultImage}
          alt="Station image"
          className="w-full h-full"
          style={{ 
            objectFit: "cover",
            backgroundColor: "#f3f4f6",
            width: "100%",
            height: "100%"
          }}
          onError={(e) => {
            e.target.src = defaultImage
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative rounded-t-2xl overflow-hidden" style={{ height: "192px" }}>
      <div className="overflow-hidden h-full">
        <div
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {processedImages.map((img, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img
                src={img || defaultImage}
                alt={`Station image ${index + 1}`}
                className="w-full h-full"
                style={{ 
                  objectFit: "cover",
                  backgroundColor: "#f3f4f6",
                  width: "100%",
                  height: "100%"
                }}
                onError={(e) => {
                  e.target.src = defaultImage
                }}
              />
            </div>
          ))}
        </div>
      </div>

        {/* Left Arrow */}
        <button
          style={{
            position: "absolute",
            left: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "0.5rem",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.5rem",
            height: "2.5rem",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(0, 0, 0, 0.9)"
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            moveCarousel(stationId, -1)
          }}
          aria-label="Previous image"
        >
          <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "0.5rem",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.5rem",
            height: "2.5rem",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(0, 0, 0, 0.9)"
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            moveCarousel(stationId, 1)
          }}
          aria-label="Next image"
        >
          <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "0.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.25rem",
          }}
        >
          {processedImages.map((_, index) => (
            <button
              key={index}
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: index === currentIndex ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.5)",
              }}
              onClick={() =>
                setCarouselStates((prev) => ({
                  ...prev,
                  [stationId]: { currentIndex: index },
                }))
              }
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    )
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentStations = Array.isArray(filteredData) ? filteredData.slice(startIndex, endIndex) : []

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement des stations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards Row */}
        <div className="flex flex-wrap -mx-3 mb-6">
          {/* Card 1 - Total Stations */}
          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-blue-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        Total Stations
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">{stationsData.length}</h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-emerald-500">
                          +{Math.floor(stationsData.length * 0.12)}
                        </span>{" "}
                        ce mois-ci
                      </p>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-full bg-gradient-to-tl from-blue-500 to-blue-600">
                      <svg
                        className="w-6 h-6 text-white relative top-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Active Stations */}
          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-green-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        Stations actives
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">
                        {stationsData.filter((s) => s.statut === "actif").length}
                      </h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-emerald-500">
                          {stationsData.length > 0
                            ? Math.round(
                                (stationsData.filter((s) => s.statut === "actif").length / stationsData.length) * 100,
                              )
                            : 0}
                          %
                        </span>{" "}
                        du total
                      </p>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-full bg-gradient-to-tl from-green-500 to-green-600">
                      <svg
                        className="w-6 h-6 text-white relative top-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Puissance totale */}
          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-orange-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        Puissance totale
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">
                        {stationsData.reduce((sum, station) => sum + (station.puissance || 0), 0)}W
                      </h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-emerald-500">
                          Moyenne:{" "}
                          {stationsData.length > 0
                            ? Math.round(
                                stationsData.reduce((sum, station) => sum + (station.puissance || 0), 0) /
                                  stationsData.length,
                              )
                            : 0}
                          W
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-full bg-gradient-to-tl from-orange-500 to-red-500">
                      <svg
                        className="w-6 h-6 text-white relative top-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - Maintenance */}
          <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-yellow-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        En maintenance
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">
                        {stationsData.filter((s) => s.statut === "maintenance").length}
                      </h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-red-600">
                          {stationsData.length > 0
                            ? Math.round(
                                (stationsData.filter((s) => s.statut === "maintenance").length / stationsData.length) *
                                  100,
                              )
                            : 0}
                          %
                        </span>{" "}
                        du total
                      </p>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-full bg-gradient-to-tl from-yellow-500 to-red-500">
                      <svg
                        className="w-6 h-6 text-white relative top-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="flex flex-wrap mt-6 -mx-3 mb-6">
          <div className="w-full max-w-full px-3">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-blue-100">
              <div className="flex-auto p-6">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-2xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Carte des stations
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${showMap ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showMap && (
                  <div className="mt-4">
                    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-red-50 rounded-2xl overflow-hidden border border-blue-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          className="w-16 h-16 text-blue-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-gray-600">Carte des stations - {stationsData.length} stations</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap mt-6 -mx-3 mb-6">
          <div className="w-full max-w-full px-3">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-sm rounded-2xl bg-clip-border border-0">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-800">Rechercher et filtrer les stations</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-end">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={searching ? "Recherche en cours..." : "Rechercher une station..."}
                      className="search-input w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      style={{
                        backgroundImage: searching
                          ? "none"
                          : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%239CA3AF' viewBox='0 0 24 24'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "left 1rem center",
                        backgroundSize: "1rem",
                      }}
                    />
                    {searching && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4 flex-wrap">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                      style={{ minWidth: "150px" }}
                    >
                      <option value="">Tous les types</option>
                      <option value="macro">Macro</option>
                      <option value="micro">Micro</option>
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                      style={{ minWidth: "150px" }}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="actif">Actif</option>
                      <option value="maintenance">Maintenance</option>
                    </select>

                    <select
                      value={sortFilter}
                      onChange={(e) => setSortFilter(e.target.value)}
                      className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                      style={{ minWidth: "150px" }}
                    >
                      <option value="newest">Plus récentes</option>
                      <option value="oldest">Plus anciennes</option>
                      <option value="name">Nom (A-Z)</option>
                      <option value="power">Puissance (haute)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stations Grid */}
        <div className="mt-4 mb-4">
          <div className="bg-white p-3 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Stations ({filteredData.length})</h3>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#3B82F6",
                  color: "white",
                  fontWeight: "500",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#1d4ed8"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#3B82F6"
                }}
              >
                <svg
                  style={{ width: "1.25rem", height: "1.25rem" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle Station
              </button>
            </div>

            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
                <p className="text-gray-600">Aucune station trouvée</p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="mt-2 text-blue-600 hover:text-blue-800">
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-7 gap-y-6 justify-start w-full" style={{ gap: "28px 24px" }}>
                {currentStations.map((station) => (
                  <div
                    key={station.id}
                    style={{
                      width: "100%",
                      maxWidth: "360px",
                      height: "450px",
                      backgroundColor: "white",
                      borderRadius: "0.5rem",
                      border: "1px solid #f3f4f6",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                      e.currentTarget.style.borderColor = "#dbeafe"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none"
                      e.currentTarget.style.borderColor = "#f3f4f6"
                    }}
                  >
                    {/* Menu des trois points avec SVG */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className="relative">
                        <button
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselStates(prev => ({
                              ...prev,
                              [station._id]: {
                                ...prev[station._id],
                                showMenu: !prev[station._id]?.showMenu
                              }
                            }));
                          }}
                        >
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </button>
                        
                        {/* Menu déroulant avec SVG */}
                        {carouselStates[station._id]?.showMenu && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                            <div className="py-1">
                              <button
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Modifier", station._id);
                                }}
                              >
                                {/* SVG pour l'icône de modification */}
                                <svg 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="mr-2"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Modifier
                              </button>
                              <button
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Supprimer", station._id);
                                }}
                              >
                                {/* SVG pour l'icône de suppression */}
                                <svg 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="mr-2"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ position: "relative", height: "12rem", flexGrow: 0 }}>
                      {createCarousel(station.images_secteurs, station._id)}
                    </div>

                    {/* Content */}
                    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "#1f2937",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {station.nom}
                        </h3>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "9999px",
                            backgroundColor:
                              station.type_technique === "macro"
                                ? "#dbeafe"
                                : station.type_technique === "micro"
                                  ? "#dcfce7"
                                  : station.type_technique === "indoor"
                                    ? "#f3e8ff"
                                    : "#fed7aa",
                            color:
                              station.type_technique === "macro"
                                ? "#1d4ed8"
                                : station.type_technique === "micro"
                                  ? "#16a34a"
                                  : station.type_technique === "indoor"
                                    ? "#7c3aed"
                                    : "#ea580c",
                            border: `1px solid ${
                              station.type_technique === "macro"
                                ? "#bfdbfe"
                                : station.type_technique === "micro"
                                  ? "#bbf7d0"
                                  : station.type_technique === "indoor"
                                    ? "#e9d5ff"
                                    : "#fed7aa"
                            }`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {station.type_technique}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#4b5563" }}>
                          <svg
                            style={{ width: "1rem", height: "1rem", marginRight: "0.5rem", color: "#3b82f6" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span style={{ fontWeight: "500" }}>Puissance:</span>
                          <span style={{ marginLeft: "0.25rem", color: "#1f2937" }}>{station.puissance || 0}W</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#4b5563" }}>
                          <svg
                            style={{ width: "1rem", height: "1rem", marginRight: "0.5rem", color: "#10b981" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                            />
                          </svg>
                          <span style={{ fontWeight: "500" }}>Génération:</span>
                          <span
                            style={{
                              marginLeft: "0.25rem",
                              backgroundColor:
                                station.generation === "5G"
                                  ? "#dcfce7"
                                  : station.generation === "4G"
                                    ? "#dbeafe"
                                    : "#fef3c7",
                              color:
                                station.generation === "5G"
                                  ? "#16a34a"
                                  : station.generation === "4G"
                                    ? "#1d4ed8"
                                    : "#d97706",
                              padding: "0.125rem 0.375rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                            }}
                          >
                            {station.generation || "N/A"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#4b5563" }}>
                          <svg
                            style={{ width: "1rem", height: "1rem", marginRight: "0.5rem", color: "#8b5cf6" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span style={{ fontWeight: "500" }}>Fournisseur:</span>
                          <span
                            style={{
                              marginLeft: "0.25rem",
                              color: "#1f2937",
                              backgroundColor: "#f3f4f6",
                              padding: "0.125rem 0.375rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                            }}
                          >
                            {station.fournisseur || "N/A"}
                          </span>
                        </div>

                        {station.position_x && station.position_y && (
                          <div
                            style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#4b5563" }}
                          >
                            <svg
                              style={{ width: "1rem", height: "1rem", marginRight: "0.5rem", color: "#ef4444" }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span style={{ fontWeight: "500" }}>Position:</span>
                            <span style={{ marginLeft: "0.25rem", color: "#1f2937", fontSize: "0.75rem" }}>
                              {Number.parseFloat(station.position_x).toFixed(4)},{" "}
                              {Number.parseFloat(station.position_y).toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: "auto" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            backgroundColor: "#f9fafb",
                            borderRadius: "0.5rem",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <svg
                              style={{ width: "1rem", height: "1rem", color: "#3b82f6", marginRight: "0.25rem" }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              {station.date_installation
                                ? new Date(station.date_installation).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "9999px",
                              backgroundColor: station.statut === "actif" ? "#dcfce7" : "#fef3c7",
                              color: station.statut === "actif" ? "#16a34a" : "#d97706",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <div
                              style={{
                                width: "0.5rem",
                                height: "0.5rem",
                                borderRadius: "50%",
                                backgroundColor: station.statut === "actif" ? "#16a34a" : "#d97706",
                              }}
                            />
                            {station.statut === "actif" ? "Active" : "Maintenance"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap mt-6 -mx-3">
            <div className="w-full max-w-full px-3">
              <div className="flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          page === currentPage
                            ? "text-white bg-blue-500 border border-blue-500"
                            : "text-gray-600 bg-white border border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal AddStation */}
      <AddStation
        showModal={showModal}
        setShowModal={setShowModal}
        onStationAdded={handleStationAdded}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      {/* PopUp */}
      <PopUp
        type={popup.type}
        message={popup.message}
        isVisible={popup.isVisible}
        onClose={closePopup}
      />
    </div>
  )
}

export default StationList
