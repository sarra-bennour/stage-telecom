"use client"

import { useState, useEffect } from "react"

const StationList = () => {
  // Sample data for cards
  const cardsData = [
    {
      id: 1,
      title: "Beautiful Sunset",
      category: "nature",
      description: "A stunning sunset over the mountains with vibrant colors painting the sky.",
      date: "2024-01-15",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 2,
      title: "City Skyline",
      category: "city",
      description: "Modern city skyline with towering skyscrapers and bustling streets below.",
      date: "2024-01-20",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 3,
      title: "Mountain Adventure",
      category: "travel",
      description: "Epic mountain hiking adventure with breathtaking views and challenging trails.",
      date: "2024-01-10",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 4,
      title: "Delicious Cuisine",
      category: "food",
      description: "Gourmet dishes prepared with fresh ingredients and artistic presentation.",
      date: "2024-01-25",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 5,
      title: "Ocean Waves",
      category: "nature",
      description: "Peaceful ocean waves crashing against the rocky coastline at dawn.",
      date: "2024-01-12",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 6,
      title: "Urban Life",
      category: "city",
      description: "The vibrant energy of urban life captured in busy streets and neon lights.",
      date: "2024-01-18",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 7,
      title: "Forest Trail",
      category: "nature",
      description: "Serene forest trail winding through ancient trees and dappled sunlight.",
      date: "2024-01-08",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 8,
      title: "Street Food",
      category: "food",
      description: "Authentic street food from local vendors with amazing flavors and spices.",
      date: "2024-01-22",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
    {
      id: 9,
      title: "Desert Landscape",
      category: "travel",
      description: "Vast desert landscape with rolling sand dunes and endless horizons.",
      date: "2024-01-05",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      ],
    },
  ]

  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState([...cardsData])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortFilter, setSortFilter] = useState("newest")
  const [showMap, setShowMap] = useState(false)
  const [carouselStates, setCarouselStates] = useState({})

  const itemsPerPage = 6

  // Apply filters and search
  useEffect(() => {
    const filtered = cardsData.filter((card) => {
      const matchesSearch =
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || card.category === categoryFilter
      return matchesSearch && matchesCategory
    })

    // Sort data
    filtered.sort((a, b) => {
      switch (sortFilter) {
        case "oldest":
          return new Date(a.date) - new Date(b.date)
        case "name":
          return a.title.localeCompare(b.title)
        case "newest":
        default:
          return new Date(b.date) - new Date(a.date)
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, sortFilter])

  // Carousel functionality
  const moveCarousel = (cardId, direction) => {
    const card = cardsData.find((c) => c.id === cardId)
    if (!card) return

    setCarouselStates((prev) => {
      const currentIndex = prev[cardId]?.currentIndex || 0
      let newIndex = currentIndex + direction

      if (newIndex < 0) {
        newIndex = card.images.length - 1
      } else if (newIndex >= card.images.length) {
        newIndex = 0
      }

      return {
        ...prev,
        [cardId]: { currentIndex: newIndex },
      }
    })
  }

  // Get category colors
  const getCategoryColor = (category) => {
    const colors = {
      nature: "bg-green-100 text-green-700 border-green-200",
      city: "bg-blue-100 text-blue-700 border-blue-200",
      travel: "bg-red-100 text-red-700 border-red-200",
      food: "bg-orange-100 text-orange-700 border-orange-200",
    }
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  // Create carousel component - FIXED VERSION
  const createCarousel = (images, cardId) => {
    const currentIndex = carouselStates[cardId]?.currentIndex || 0

    if (images.length <= 1) {
      return (
        <div className="rounded-t-2xl overflow-hidden">
          <img src={images[0] || "/placeholder.svg"} alt="Card image" className="w-full h-48 object-cover" />
        </div>
      )
    }

    return (
      <div className="relative rounded-t-2xl overflow-hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <img
                key={index}
                src={img || "/placeholder.svg"}
                alt={`Card image ${index + 1}`}
                className="w-full h-48 object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Left Arrow */}
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-10"
          onClick={() => moveCarousel(cardId, -1)}
          aria-label="Previous image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-10"
          onClick={() => moveCarousel(cardId, 1)}
          aria-label="Next image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? "bg-white bg-opacity-100" : "bg-white bg-opacity-50"
              }`}
              onClick={() =>
                setCarouselStates((prev) => ({
                  ...prev,
                  [cardId]: { currentIndex: index },
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
  const currentCards = filteredData.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards Row */}
        <div className="flex flex-wrap -mx-3 mb-6">
          {/* Card 1 */}
          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-blue-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        Total Users
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">12,345</h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-emerald-500">+55%</span> since
                        yesterday
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-red-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        Revenue
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">$89,432</h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-emerald-500">+3%</span> since last
                        week
                      </p>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-full bg-gradient-to-tl from-red-500 to-red-600">
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
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-blue-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        Orders
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">1,234</h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-red-600">-2%</span> since last
                        quarter
                      </p>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-full bg-gradient-to-tl from-blue-500 to-red-500">
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border border border-red-100 hover:shadow-2xl transition-all duration-200">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-gray-600">
                        Rating
                      </p>
                      <h5 className="mb-2 font-semibold text-gray-800">4.8</h5>
                      <p className="mb-0 text-gray-600">
                        <span className="text-sm font-semibold leading-normal text-emerald-500">+5%</span> than last
                        month
                      </p>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-full bg-gradient-to-tl from-red-500 to-blue-500">
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
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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
                  Map
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
                    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-red-50 rounded-2xl overflow-hidden border border-blue-200">
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                        alt="World Map"
                        className="w-full h-full object-cover"
                      />
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
                  <h2 className="text-lg font-semibold text-gray-800">Search & Filter Cards</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-end">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search cards..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                    <svg
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                    >
                      <option value="">All Categories</option>
                      <option value="nature">Nature</option>
                      <option value="city">City</option>
                      <option value="travel">Travel</option>
                      <option value="food">Food</option>
                    </select>

                    <select
                      value={sortFilter}
                      onChange={(e) => setSortFilter(e.target.value)}
                      className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid - FIXED LAYOUT */}
        <div className="mt-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCards.map((card) => (
              <div
                key={card.id}
                className="bg-white shadow-xl rounded-2xl border border-blue-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-200 overflow-hidden"
              >
                {createCarousel(card.images, card.id)}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(card.category)}`}
                    >
                      {card.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{card.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(card.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {card.images.length} photos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
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
                          ? "text-white bg-gradient-to-r from-blue-500 to-red-500 border border-blue-500"
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
      </div>
    </div>
  )
}

export default StationList
