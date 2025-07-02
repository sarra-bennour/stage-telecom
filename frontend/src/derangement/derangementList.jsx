"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./derangement-crud.css"
import AddDerangement from "./addDerangement"

const DerangementList = () => {
  // State management
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [derangementsData, setDerangementsData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [prioriteFilter, setPrioriteFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortDirection, setSortDirection] = useState("desc")
  const [showModal, setShowModal] = useState(false)
  const [editingDerangement, setEditingDerangement] = useState(null)
  const [editMode, setEditMode] = useState(false)

  // Pagination
  const itemsPerPage = 15

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/users/check-auth", {
          withCredentials: true,
        })
        setUser(response.data.data?.user || null)
      } catch (error) {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Fetch derangements from backend
  const fetchDerangements = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3000/derangements/derangement-list")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des dérangements")
      }

      const data = await response.json()
      setDerangementsData(data.data || [])
      setFilteredData(data.data || [])
    } catch (err) {
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDerangements()
  }, [])

  const handleDerangementAdded = (newDerangement) => {
    setDerangementsData((prev) => [newDerangement, ...prev])
    setFilteredData((prev) => [newDerangement, ...prev])
  }

  const handleEditClick = (derangement) => {
    setEditingDerangement(derangement)
    setEditMode(true)
    setShowModal(true)
  }

  const handleSuccess = (message) => {
    console.log("Success:", message)
    // Vous pouvez ajouter ici votre système de notification
  }

  const handleError = (message) => {
    console.error("Error:", message)
    // Vous pouvez ajouter ici votre système de notification
  }

  // Apply filters and search
  useEffect(() => {
    const filtered = derangementsData.filter((derangement) => {
      const matchesSearch =
        derangement.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        derangement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        derangement.priorite?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = !typeFilter || derangement.type === typeFilter
      const matchesPriorite = !prioriteFilter || derangement.priorite === prioriteFilter

      let matchesDate = true
      if (dateFilter) {
        const filterDate = new Date(dateFilter)
        const derangementDate = new Date(derangement.date_occurrence)
        matchesDate = derangementDate.toDateString() === filterDate.toDateString()
      }

      return matchesSearch && matchesType && matchesPriorite && matchesDate
    })

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date_occurrence)
      const dateB = new Date(b.date_occurrence)
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, typeFilter, prioriteFilter, dateFilter, sortDirection, derangementsData])

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      énergie: "fas fa-bolt",
      environnement: "fas fa-leaf",
      transmission: "fas fa-broadcast-tower",
      hardware: "fas fa-microchip",
      software: "fas fa-code",
      qualité: "fas fa-star",
    }
    return icons[type] || "fas fa-exclamation-triangle"
  }

  // Get priority color
  const getPriorityColor = (priorite) => {
    const colors = {
      faible: "low",
      moyenne: "medium",
      haute: "high",
    }
    return colors[priorite] || "medium"
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format relative time
  const getRelativeTime = (date) => {
    const now = new Date()
    const diffTime = Math.abs(now - new Date(date))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Aujourd'hui"
    if (diffDays === 2) return "Hier"
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`
    if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`
    return `Il y a ${Math.ceil(diffDays / 30)} mois`
  }

  // Group derangements by date
  const groupByDate = (derangements) => {
    const groups = {}
    derangements.forEach((derangement) => {
      const date = new Date(derangement.date_occurrence).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(derangement)
    })
    return groups
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDerangements = filteredData.slice(startIndex, endIndex)
  const groupedDerangements = groupByDate(currentDerangements)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="derangement-history-loading">
        <div className="derangement-history-loading-content">
          <div className="derangement-history-loading-spinner"></div>
          <p className="derangement-history-loading-text">Chargement de l'historique...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="derangement-history">
      <div className="derangement-history-container">
        {/* Header */}
        <div className="derangement-history-header">
          <div className="derangement-history-header-content">
            <div className="derangement-history-title-section">
              <h1 className="derangement-history-title">
                <i className="fas fa-history"></i>
                Historique des Dérangements
              </h1>
              <p className="derangement-history-subtitle">Suivi chronologique des incidents et problèmes techniques</p>
            </div>
            <div className="derangement-history-stats">
              <div className="derangement-history-stat-item">
                <span className="derangement-history-stat-number">{derangementsData.length}</span>
                <span className="derangement-history-stat-label">Total</span>
              </div>
              <div className="derangement-history-stat-item">
                <span className="derangement-history-stat-number">
                  {derangementsData.filter((d) => d.priorite === "haute").length}
                </span>
                <span className="derangement-history-stat-label">Haute priorité</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="derangement-history-filters">
          <div className="derangement-history-filters-row">
            <div className="derangement-history-search-container">
              <div className="derangement-history-search-icon">
                <i className="fas fa-search"></i>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="derangement-history-search-input"
                placeholder="Rechercher dans l'historique..."
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="derangement-history-select"
            >
              <option value="">Tous les types</option>
              <option value="énergie">Énergie</option>
              <option value="environnement">Environnement</option>
              <option value="transmission">Transmission</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="qualité">Qualité</option>
            </select>

            <select
              value={prioriteFilter}
              onChange={(e) => setPrioriteFilter(e.target.value)}
              className="derangement-history-select"
            >
              <option value="">Toutes priorités</option>
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="derangement-history-date-input"
            />

            <button
              onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
              className="derangement-history-sort-btn"
              title={`Trier par date ${sortDirection === "desc" ? "croissante" : "décroissante"}`}
            >
              <i className={`fas fa-sort-amount-${sortDirection === "desc" ? "down" : "up"}`}></i>
            </button>
          </div>
        </div>

        <div className="derangement-history-add-button-container">
          <button
            onClick={() => {
              setEditMode(false)
              setEditingDerangement(null)
              setShowModal(true)
            }}
            className="derangement-history-add-btn"
          >
            <i className="fas fa-plus"></i>
            Nouveau Dérangement
          </button>
        </div>

        {/* Timeline */}
        <div className="derangement-history-timeline-container">
          {filteredData.length === 0 ? (
            <div className="derangement-history-empty">
              <div className="derangement-history-empty-content">
                <i className="fas fa-clipboard-list"></i>
                <h3 className="derangement-history-empty-title">Aucun dérangement trouvé</h3>
                <p className="derangement-history-empty-subtitle">
                  {searchTerm || typeFilter || prioriteFilter || dateFilter
                    ? "Essayez de modifier vos filtres de recherche"
                    : "L'historique des dérangements apparaîtra ici"}
                </p>
                {(searchTerm || typeFilter || prioriteFilter || dateFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setTypeFilter("")
                      setPrioriteFilter("")
                      setDateFilter("")
                    }}
                    className="derangement-history-clear-filters"
                  >
                    <i className="fas fa-times"></i>
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="derangement-history-timeline">
              {Object.entries(groupedDerangements).map(([dateString, derangements]) => (
                <div key={dateString} className="derangement-history-date-group">
                  <div className="derangement-history-date-header">
                    <div className="derangement-history-date-badge">
                      <i className="fas fa-calendar-day"></i>
                      <span className="derangement-history-date-text">
                        {new Date(dateString).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="derangement-history-date-relative">{getRelativeTime(dateString)}</span>
                    </div>
                    <div className="derangement-history-date-count">
                      {derangements.length} incident{derangements.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="derangement-history-timeline-items">
                    {derangements.map((derangement, index) => (
                      <div key={derangement._id} className="derangement-history-timeline-item">
                        <div className="derangement-history-timeline-marker">
                          <div
                            className={`derangement-history-timeline-dot priority-${getPriorityColor(derangement.priorite)}`}
                          >
                            <i className={getTypeIcon(derangement.type)}></i>
                          </div>
                          {index < derangements.length - 1 && <div className="derangement-history-timeline-line"></div>}
                        </div>

                        <div className="derangement-history-timeline-content">
                          <div className="derangement-history-item-header">
                            <div className="derangement-history-item-type">
                              <span className={`derangement-history-type-badge type-${derangement.type}`}>
                                <i className={getTypeIcon(derangement.type)}></i>
                                {derangement.type.charAt(0).toUpperCase() + derangement.type.slice(1)}
                              </span>
                              <span
                                className={`derangement-history-priority-badge priority-${getPriorityColor(derangement.priorite)}`}
                              >
                                <i className="fas fa-flag"></i>
                                {derangement.priorite.charAt(0).toUpperCase() + derangement.priorite.slice(1)}
                              </span>
                            </div>
                            <div className="derangement-history-item-time">
                              <i className="fas fa-clock"></i>
                              {new Date(derangement.date_occurrence).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>

                          <div className="derangement-history-item-body">
                            <p className="derangement-history-item-description">
                              {derangement.description || "Aucune description disponible"}
                            </p>

                            <div className="derangement-history-item-footer">
                              <div className="derangement-history-item-ticket">
                                <i className="fas fa-ticket-alt"></i>
                                  <span>Ticket: {derangement.ticket?.numero || derangement.ticket?._id || 'N/A'}</span>
                              </div>
                              <div className="derangement-history-item-created">
                                <i className="fas fa-plus-circle"></i>
                                <span>Créé le {formatDate(derangement.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="derangement-history-pagination">
              <div className="derangement-history-pagination-info">
                <span>
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length}{" "}
                  dérangements
                </span>
              </div>
              <div className="derangement-history-pagination-controls">
                <button
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="derangement-history-pagination-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                  Précédent
                </button>

                <div className="derangement-history-pagination-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`derangement-history-pagination-btn ${pageNum === currentPage ? "active" : ""}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="derangement-history-pagination-btn"
                >
                  Suivant
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal AddDerangement */}
      <AddDerangement
        showModal={showModal}
        setShowModal={setShowModal}
        onDerangementAdded={handleDerangementAdded}
        onSuccess={handleSuccess}
        onError={handleError}
        editingDerangement={editingDerangement}
        editMode={editMode}
      />
    </div>
  )
}

export default DerangementList
