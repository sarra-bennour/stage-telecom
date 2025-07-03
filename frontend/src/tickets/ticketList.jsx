"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AddTicket from "./AddTicket"
import PopUp from "../partials/popup"
import "./ticket-crud.css"

const TicketList = () => {
  // State management
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [ticketsData, setTicketsData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statutFilter, setStatutFilter] = useState("")
  const [sortField, setSortField] = useState("date_creation")
  const [sortDirection, setSortDirection] = useState("desc")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingTicket, setEditingTicket] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])

  // États pour les Popups
  const [popup, setPopup] = useState({
    type: "",
    message: "",
    isVisible: false,
  })

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

  // Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3000/tickets/ticket-list")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des tickets")
      }

      const data = await response.json()
      setTicketsData(data.data || [])
      setFilteredData(data.data || [])
    } catch (err) {
      console.error("Erreur:", err)
      handleError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleTicketAdded = (newTicket) => {
    setTicketsData((prev) => [newTicket, ...prev])
    setFilteredData((prev) => [newTicket, ...prev])
  }

  const handleEditClick = (ticket) => {
    setEditingTicket(ticket)
    setEditMode(true)
    setShowModal(true)
  }

  const handleDeleteClick = async (ticketId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce ticket ?")) {
      try {
        const response = await fetch(`http://localhost:3000/tickets/delete-ticket/${ticketId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression")
        }

        setTicketsData((prev) => prev.filter((ticket) => ticket._id !== ticketId))
        setFilteredData((prev) => prev.filter((ticket) => ticket._id !== ticketId))
        handleSuccess("Ticket supprimé avec succès !")
      } catch (err) {
        handleError(err.message)
      }
    }
  }

  const handleSuccess = (message) => {
    setPopup({ type: "success", message: message, isVisible: true })
  }

  const handleError = (message) => {
    setPopup({ type: "error", message: message, isVisible: true })
  }

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, isVisible: false }))
  }

  const itemsPerPage = 4

  // Apply filters and search
  useEffect(() => {
    const filtered = ticketsData.filter((ticket) => {
      const matchesSearch =
        ticket.description_resolution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.superviseur_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.technicien_id?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatut = !statutFilter || ticket.statut === statutFilter
      return matchesSearch && matchesStatut
    })

    // Sort data
    filtered.sort((a, b) => {
      const aValue = String(a[sortField] || "").toLowerCase()
      const bValue = String(b[sortField] || "").toLowerCase()

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, statutFilter, sortField, sortDirection, ticketsData])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTickets = filteredData.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "ouvert":
        return "fa-exclamation-circle"
      case "en_cours":
        return "fa-clock"
      case "résolu":
        return "fa-check-circle"
      default:
        return "fa-question-circle"
    }
  }

  const getStatusColor = (statut) => {
    switch (statut) {
      case "ouvert":
        return "danger"
      case "en_cours":
        return "warning"
      case "résolu":
        return "success"
      default:
        return "secondary"
    }
  }

  const formatDate = (date) => {
  const originalDate = new Date(date)
  // Add 1 hour
  originalDate.setHours(originalDate.getHours() + 1)
  
  return originalDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

  const getDaysOpen = (dateCreation) => {
    const now = new Date()
    const created = new Date(dateCreation)
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="ticket-crud-loading">
        <div className="ticket-crud-loading-content">
          <div className="ticket-crud-loading-spinner"></div>
          <p className="ticket-crud-loading-text">Chargement des tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ticket-crud">
      <div className="ticket-crud-container">

        {/* Stats Dashboard - Compact */}
        <div className="ticket-crud-stats compact">
          <div className="ticket-crud-stat-card total">
            <div className="ticket-crud-stat-icon">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <div className="ticket-crud-stat-info">
              <h3 className="ticket-crud-stat-value">{ticketsData.length}</h3>
              <p className="ticket-crud-stat-label">Total</p>
            </div>
          </div>

          <div className="ticket-crud-stat-card danger">
            <div className="ticket-crud-stat-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div className="ticket-crud-stat-info">
              <h3 className="ticket-crud-stat-value">{ticketsData.filter((t) => t.statut === "ouvert").length}</h3>
              <p className="ticket-crud-stat-label">Ouverts</p>
            </div>
          </div>

          <div className="ticket-crud-stat-card warning">
            <div className="ticket-crud-stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="ticket-crud-stat-info">
              <h3 className="ticket-crud-stat-value">{ticketsData.filter((t) => t.statut === "en_cours").length}</h3>
              <p className="ticket-crud-stat-label">En Cours</p>
            </div>
          </div>

          <div className="ticket-crud-stat-card success">
            <div className="ticket-crud-stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="ticket-crud-stat-info">
              <h3 className="ticket-crud-stat-value">{ticketsData.filter((t) => t.statut === "résolu").length}</h3>
              <p className="ticket-crud-stat-label">Résolus</p>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="ticket-crud-controls">
          <div className="ticket-crud-filters">
            <div className="ticket-crud-search-container">
              <i className="fas fa-search ticket-crud-search-icon"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ticket-crud-search-input"
                placeholder="Rechercher un ticket..."
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="ticket-crud-search-clear">
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="ticket-crud-select"
            >
              <option value="">Tous les statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="résolu">Résolu</option>
            </select>
          </div>
        </div>

        {/* Add Button */}
        <div className="ticket-crud-add-section">
          <button
            onClick={() => {
              setEditMode(false)
              setEditingTicket(null)
              setShowModal(true)
            }}
            className="ticket-crud-add-btn"
          >
            <i className="fas fa-plus"></i>
            Nouveau Ticket
          </button>
        </div>

        {/* Tickets Display */}
        <div className="ticket-crud-content">
          {currentTickets.length === 0 ? (
            <div className="ticket-crud-empty">
              <div className="ticket-crud-empty-content">
                <i className="fas fa-ticket-alt ticket-crud-empty-icon"></i>
                <h3 className="ticket-crud-empty-title">Aucun ticket trouvé</h3>
                <p className="ticket-crud-empty-subtitle">
                  {searchTerm || statutFilter
                    ? "Aucun résultat ne correspond à vos critères"
                    : "Commencez par créer un nouveau ticket"}
                </p>
              </div>
            </div>
          ) : (
            <div className="ticket-crud-tickets-container">
              {currentTickets.map((ticket) => (
                <div key={ticket._id} className={`ticket-crud-ticket ${getStatusColor(ticket.statut)}`}>
                  {/* Ticket Header avec perforation */}
                  <div className="ticket-crud-ticket-header">
                    <div className="ticket-crud-ticket-perforation"></div>
                    <div className="ticket-crud-ticket-number">
                      <span className="ticket-crud-ticket-label">TICKET N°</span>
                      <span className="ticket-crud-ticket-id">#{ticket.num_ticket}</span>
                    </div>
                    <div className="ticket-crud-ticket-status">
                      <span className={`ticket-crud-status-stamp ${getStatusColor(ticket.statut)}`}>
                        {ticket.statut === "ouvert" ? "OUVERT" : ticket.statut === "en_cours" ? "EN COURS" : "RÉSOLU"}
                      </span>
                    </div>
                  </div>

                  {/* Ligne de séparation perforée */}
                  <div className="ticket-crud-ticket-separator">
                    <div className="ticket-crud-perforation-line"></div>
                  </div>

                  {/* Ticket Body */}
                  <div className="ticket-crud-ticket-body">
                    <div className="ticket-crud-ticket-section">
                      <div className="ticket-crud-ticket-field">
                        <span className="ticket-crud-field-label">DESCRIPTION:</span>
                        <span className="ticket-crud-field-value">
                          {ticket.description_resolution || "Aucune description disponible"}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-crud-ticket-section">
                      <div className="ticket-crud-ticket-row">
                        <div className="ticket-crud-ticket-field">
                          <span className="ticket-crud-field-label">SUPERVISEUR:</span>
                          <span className="ticket-crud-field-value">{ticket.superviseur_id.nom} {ticket.superviseur_id.prenom}</span>
                        </div>
                        <div className="ticket-crud-ticket-field">
                          <span className="ticket-crud-field-label">TECHNICIEN:</span>
                          <span className="ticket-crud-field-value">{ticket.technicien_id.nom} {ticket.technicien_id.prenom}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ticket-crud-ticket-section">
                      <div className="ticket-crud-ticket-row">
                        <div className="ticket-crud-ticket-field">
                          <span className="ticket-crud-field-label">DATE CRÉATION:</span>
                          <span className="ticket-crud-field-value">{formatDate(ticket.date_creation)}</span>
                        </div>
                        {ticket.date_cloture ? (
                          <div className="ticket-crud-ticket-field">
                            <span className="ticket-crud-field-label">DATE CLÔTURE:</span>
                            <span className="ticket-crud-field-value">{formatDate(ticket.date_cloture)}</span>
                          </div>
                        ) : (
                          <div className="ticket-crud-ticket-field">
                            <span className="ticket-crud-field-label">DURÉE:</span>
                            <span className="ticket-crud-field-value">{getDaysOpen(ticket.date_creation)} jour(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Footer avec actions */}
                  <div className="ticket-crud-ticket-footer">
                    <div className="ticket-crud-ticket-barcode">
                      <div className="ticket-crud-barcode-lines">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      
                    </div>
                    <div className="ticket-crud-ticket-actions">
                      <button
                        onClick={() => handleEditClick(ticket)}
                        className="ticket-crud-action-btn edit"
                        title="Modifier"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDeleteClick(ticket._id)}
                          className="ticket-crud-action-btn delete"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ticket-crud-pagination">
              <div className="ticket-crud-pagination-info">
                <span>
                  Affichage de <strong>{startIndex + 1}</strong> à{" "}
                  <strong>{Math.min(endIndex, filteredData.length)}</strong> sur <strong>{filteredData.length}</strong>{" "}
                  tickets
                </span>
              </div>
              <div className="ticket-crud-pagination-controls">
                <button
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="ticket-crud-pagination-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                  Précédent
                </button>

                <div className="ticket-crud-pagination-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`ticket-crud-pagination-btn ${pageNumber === currentPage ? "active" : ""}`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ticket-crud-pagination-btn"
                >
                  Suivant
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal AddTicket */}
      <AddTicket
        showModal={showModal}
        setShowModal={setShowModal}
        onTicketAdded={handleTicketAdded}
        onSuccess={handleSuccess}
        onError={handleError}
        editingTicket={editingTicket}
        editMode={editMode}
      />

      {/* PopUp */}
      <PopUp type={popup.type} message={popup.message} isVisible={popup.isVisible} onClose={closePopup} />
    </div>
  )
}

export default TicketList
