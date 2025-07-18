"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AddTransmission from "./addTransmission"
import PopUp from "../partials/popup"
import "./transmission-crud.css"
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const TransmissionList = () => {
  // State management
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [transmissionsData, setTransmissionsData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [configurationFilter, setConfigurationFilter] = useState("")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingTransmission, setEditingTransmission] = useState(null)
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

  // Fetch transmissions from backend
  const fetchTransmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3000/transmissions/transmission-list")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des transmissions")
      }

      const data = await response.json()
      setTransmissionsData(data.data || [])
      setFilteredData(data.data || [])
    } catch (err) {
      console.error("Erreur:", err)
      handleError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransmissions()
  }, [])

  const handleTransmissionAdded = (newTransmission) => {
    setTransmissionsData((prev) => [newTransmission, ...prev])
    setFilteredData((prev) => [newTransmission, ...prev])
  }

  const handleEditClick = (transmission) => {
    const canEdit = user?.role === 'admin' || user?._id === transmission.createdBy;

    if (!canEdit) {
      handleError("Vous n'avez pas les droits pour modifier cette transmission");
      return;
    }
    setEditingTransmission(transmission)
    setEditMode(true)
    setShowModal(true)
  }

  const handleDeleteClick = async (transmissionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transmission ?")) {
      try {
        const response = await fetch(`http://localhost:3000/transmissions/delete-transmission/${transmissionId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression")
        }

        setTransmissionsData((prev) => prev.filter((transmission) => transmission._id !== transmissionId))
        setFilteredData((prev) => prev.filter((transmission) => transmission._id !== transmissionId))
        handleSuccess("Transmission supprimée avec succès !")
      } catch (err) {
        handleError(err.message)
      }
    }
  }

  const handleExport = (format) => {
    const columns = [
      { key: 'type', header: 'Type' },
      { key: 'configuration', header: 'Configuration' },
      { key: 'debit', header: 'Débit (Mbps)' },
      { key: 'fournisseur', header: 'Fournisseur' },
      { key: 'date_installation', header: 'Date Installation' },
      { key: 'date_derniere_maintenance', header: 'Dernière Maintenance' }
    ];

    const data = filteredData.map(item => ({
      ...item,
      date_installation: item.date_installation
        ? new Date(item.date_installation).toLocaleDateString("fr-FR")
        : 'N/A',
      date_derniere_maintenance: item.date_derniere_maintenance
        ? new Date(item.date_derniere_maintenance).toLocaleDateString("fr-FR")
        : 'N/A'
    }));

    if (format === 'excel') {
      exportToExcel(data, columns, 'liste_transmissions');
    } else {
      exportToPDF(data, columns, 'liste_transmissions', 'Liste des Transmissions');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} transmission(s) ?`)) {
      try {
        const deletePromises = selectedItems.map((id) =>
          fetch(`http://localhost:3000/transmissions/delete-transmission/${id}`, { method: "DELETE" }),
        )

        await Promise.all(deletePromises)

        setTransmissionsData((prev) => prev.filter((transmission) => !selectedItems.includes(transmission._id)))
        setFilteredData((prev) => prev.filter((transmission) => !selectedItems.includes(transmission._id)))
        setSelectedItems([])
        handleSuccess(`${selectedItems.length} transmission(s) supprimée(s) avec succès !`)
      } catch (err) {
        handleError("Erreur lors de la suppression multiple")
      }
    }
  }

  const handleCardClick = (id) => {
    if (user?.role !== "admin") return; // Seulement pour les admins

    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id); // Désélectionne si déjà sélectionné
      } else {
        return [...prev, id]; // Sélectionne si non sélectionné
      }
    });
  };

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
    const filtered = transmissionsData.filter((transmission) => {
      const matchesSearch =
        transmission.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transmission.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transmission.configuration?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = !typeFilter || transmission.type === typeFilter
      const matchesConfiguration = !configurationFilter || transmission.configuration === configurationFilter
      return matchesSearch && matchesType && matchesConfiguration
    })

    // Sort data
    filtered.sort((a, b) => {
      const getValue = (item, field) => {
        return item[field] || ""
      }

      const aValue = String(getValue(a, sortField)).toLowerCase()
      const bValue = String(getValue(b, sortField)).toLowerCase()

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, typeFilter, configurationFilter, sortField, sortDirection, transmissionsData])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(currentTransmissions.map((transmission) => transmission._id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id])
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id))
    }
  }


  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransmissions = filteredData.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="transmission-crud-loading">
        <div className="transmission-crud-loading-content">
          <div className="transmission-crud-loading-spinner"></div>
          <p className="transmission-crud-loading-text">Chargement des transmissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="transmission-crud">
      <div className="transmission-crud-container">
        {/* Stats Cards */}
        <div className="transmission-crud-stats">
          <div className="transmission-crud-stat-card">
            <div className="transmission-crud-stat-content">
              <i
                className="fas fa-network-wired"
                style={{
                  fontSize: "2.5rem",
                  color: "#4F46E5",
                  marginRight: "1rem",
                }}
              ></i>
              <div className="transmission-crud-stat-info">
                <dt className="transmission-crud-stat-label">Total</dt>
                <dd className="transmission-crud-stat-value">{transmissionsData.length}</dd>
              </div>
            </div>
          </div>

          <div className="transmission-crud-stat-card">
            <div className="transmission-crud-stat-content">
              <i
                className="fas fa-ethernet"
                style={{
                  fontSize: "2.5rem",
                  color: "#10B981",
                  marginRight: "1rem",
                }}
              ></i>
              <div className="transmission-crud-stat-info">
                <dt className="transmission-crud-stat-label">Fibre</dt>
                <dd className="transmission-crud-stat-value">
                  {transmissionsData.filter((t) => t.type === "fibre").length}
                </dd>
              </div>
            </div>
          </div>

          <div className="transmission-crud-stat-card">
            <div className="transmission-crud-stat-content">
              <i
                className="fas fa-broadcast-tower"
                style={{
                  fontSize: "2.5rem",
                  color: "#F59E0B",
                  marginRight: "1rem",
                }}
              ></i>
              <div className="transmission-crud-stat-info">
                <dt className="transmission-crud-stat-label">Faisceau</dt>
                <dd className="transmission-crud-stat-value">
                  {transmissionsData.filter((t) => t.type === "faisceau").length}
                </dd>
              </div>
            </div>
          </div>

          <div className="transmission-crud-stat-card">
            <div className="transmission-crud-stat-content">
              <i
                className="fas fa-phone-alt"
                style={{
                  fontSize: "2.5rem",
                  color: "#EF4444",
                  marginRight: "1rem",
                }}
              ></i>
              <div className="transmission-crud-stat-info">
                <dt className="transmission-crud-stat-label">HDSL</dt>
                <dd className="transmission-crud-stat-value">
                  {transmissionsData.filter((t) => t.type === "hdsl").length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="transmission-crud-filters">
          <div className="transmission-crud-filters-header">
            <div className="transmission-crud-filters-content">
              <div className="transmission-crud-search-container">
                <div className="transmission-crud-search-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="transmission-crud-search-input"
                  placeholder="Rechercher une transmission..."
                />
              </div>

              <div className="transmission-crud-filters-row">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="transmission-crud-select"
                >
                  <option value="">Tous les types</option>
                  <option value="hdsl">HDSL</option>
                  <option value="fibre">Fibre</option>
                  <option value="faisceau">Faisceau</option>
                  <option value="autres">Autres</option>
                </select>

                <select
                  value={configurationFilter}
                  onChange={(e) => setConfigurationFilter(e.target.value)}
                  className="transmission-crud-select"
                >
                  <option value="">Toutes les configurations</option>
                  <option value="1+1">1+1</option>
                  <option value="1+0">1+0</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && user?.role === "admin" && (
            <div className="transmission-crud-bulk-actions">
              <span className="transmission-crud-bulk-text">{selectedItems.length} élément(s) sélectionné(s)</span>
              <button onClick={handleBulkDelete} className="transmission-crud-bulk-delete-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "780px", marginBottom: "10px" }}>
          <button
            onClick={() => handleExport('excel')}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "0.5rem",
              backgroundColor: "#10B981",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#059669";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#10B981";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <i className="fas fa-file-excel"></i> Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "0.5rem",
              backgroundColor: "#EF4444",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#DC2626";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#EF4444";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <i className="fas fa-file-pdf"></i> PDF
          </button>

          {user?.role !== "technicien" && (
            <button
              onClick={() => {
                setEditMode(false)
                setEditingTransmission(null)
                setShowModal(true)
              }}
              className="transmission-crud-add-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle Transmission
            </button>
          )}
        </div>

        {/* Table */}
        <div className="transmission-crud-table-container">
          {/* Cards Grid */}
          <div className="transmission-crud-cards-container">
            <div className="transmission-crud-cards-header">
              <h3 className="transmission-crud-cards-title">Transmissions ({filteredData.length})</h3>
            </div>

            {filteredData.length === 0 ? (
              <div className="transmission-crud-empty-state">
                <div className="transmission-crud-empty-content">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  </svg>
                  <p className="transmission-crud-empty-title">Aucune transmission trouvée</p>
                  <p className="transmission-crud-empty-subtitle">Commencez par créer une nouvelle transmission</p>
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="transmission-crud-clear-search">
                      Effacer la recherche
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="transmission-crud-cards-grid">
                {currentTransmissions.map((transmission) => (
                  <div
                    key={transmission._id}
                    className={`transmission-crud-card ${selectedItems.includes(transmission._id) ? 'selected' : ''}`}
                    onClick={() => handleCardClick(transmission._id)}
                  >
                    {/* Card Header */}
                    <div className="transmission-crud-card-header">
                      {user?.role === "admin" && (
                        <div
                          className="transmission-crud-card-checkbox"
                          onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(transmission._id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectItem(transmission._id, e.target.checked);
                            }}
                            className="transmission-crud-hidden-checkbox"
                          />
                        </div>
                      )}
                      <div className="transmission-crud-card-type">
                        <div
                          className={`transmission-crud-type-icon type-${transmission.type?.toLowerCase() || "autres"}`}
                        >
                          {transmission.type === "fibre" && <i className="fas fa-ethernet"></i>}
                          {transmission.type === "faisceau" && <i className="fas fa-broadcast-tower"></i>}
                          {transmission.type === "hdsl" && <i className="fas fa-phone-alt"></i>}
                          {transmission.type === "autres" && <i className="fas fa-network-wired"></i>}
                        </div>
                        <div className="transmission-crud-card-type-info">
                          <h3 className="transmission-crud-card-title">{transmission.type?.toUpperCase() || "N/A"}</h3>
                          <p className="transmission-crud-card-subtitle">
                            {transmission.configuration ? `Config ${transmission.configuration}` : "Configuration N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="transmission-crud-card-actions">
                        {user?.role !== "technicien" && (
                          <button
                            onClick={() => handleEditClick(transmission)}
                            className="transmission-crud-action-btn edit"
                            title="Modifier"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDeleteClick(transmission._id)}
                            className="transmission-crud-action-btn delete"
                            title="Supprimer"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="transmission-crud-card-body">
                      <div className="transmission-crud-card-stats">
                        <div className="transmission-crud-stat-item">
                          <div className="transmission-crud-stat-icon">
                            <i className="fas fa-tachometer-alt"></i>
                          </div>
                          <div className="transmission-crud-stat-details">
                            <span className="transmission-crud-stat-label">Débit</span>
                            <span className="transmission-crud-stat-value">
                              {transmission.debit ? `${transmission.debit} Mbps` : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="transmission-crud-stat-item">
                          <div className="transmission-crud-stat-icon">
                            <i className="fas fa-building"></i>
                          </div>
                          <div className="transmission-crud-stat-details">
                            <span className="transmission-crud-stat-label">Fournisseur</span>
                            <span className="transmission-crud-stat-value">{transmission.fournisseur || "N/A"}</span>
                          </div>
                        </div>

                        <div className="transmission-crud-stat-item">
                          <div className="transmission-crud-stat-icon">
                            <i className="fas fa-calendar-alt"></i>
                          </div>
                          <div className="transmission-crud-stat-details">
                            <span className="transmission-crud-stat-label">Installation</span>
                            <span className="transmission-crud-stat-value">
                              {transmission.date_installation
                                ? new Date(transmission.date_installation).toLocaleDateString("fr-FR")
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {transmission.date_derniere_maintenance && (
                          <div className="transmission-crud-stat-item">
                            <div className="transmission-crud-stat-icon">
                              <i className="fas fa-tools"></i>
                            </div>
                            <div className="transmission-crud-stat-details">
                              <span className="transmission-crud-stat-label">Dernière maintenance</span>
                              <span className="transmission-crud-stat-value">
                                {new Date(transmission.date_derniere_maintenance).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {transmission.observation && (
                        <div className="transmission-crud-card-observation">
                          <h4 className="transmission-crud-observation-title">
                            <i className="fas fa-sticky-note"></i>
                            Observations
                          </h4>
                          <p className="transmission-crud-observation-text">{transmission.observation}</p>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="transmission-crud-pagination">
              <div className="transmission-crud-pagination-mobile">
                <button
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="transmission-crud-pagination-btn"
                >
                  Précédent
                </button>
                <button
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="transmission-crud-pagination-btn"
                >
                  Suivant
                </button>
              </div>
              <div className="transmission-crud-pagination-desktop">
                <div>
                  <p className="transmission-crud-pagination-info">
                    Affichage de <span className="font-medium">{startIndex + 1}</span> à{" "}
                    <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> sur{" "}
                    <span className="font-medium">{filteredData.length}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="transmission-crud-pagination-nav">
                    <button
                      onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="transmission-crud-pagination-btn"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`transmission-crud-pagination-btn ${page === currentPage ? "active" : ""}`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="transmission-crud-pagination-btn"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal AddTransmission */}
      <AddTransmission
        showModal={showModal}
        setShowModal={setShowModal}
        onTransmissionAdded={handleTransmissionAdded}
        onSuccess={handleSuccess}
        onError={handleError}
        editingTransmission={editingTransmission}
        editMode={editMode}
        currentUserId={user?._id}
      />

      {/* PopUp */}
      <PopUp type={popup.type} message={popup.message} isVisible={popup.isVisible} onClose={closePopup} />
    </div>
  )
}

export default TransmissionList
