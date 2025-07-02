"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AddAntenne from "./addAntenne"
import PopUp from "../partials/popup"
import "./antenne-crud.css"

const AntennesList = () => {
  // State management
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [antennesData, setAntennesData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [etatFilter, setEtatFilter] = useState("")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingAntenne, setEditingAntenne] = useState(null)
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
        console.log("user", response.data.data.user)
        setUser(response.data.data?.user || null)
      } catch (error) {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Fetch antennes from backend
  const fetchAntennes = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3000/antennes/antenne-list")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des antennes")
      }

      const data = await response.json()
      setAntennesData(data.data || [])
      setFilteredData(data.data || [])
    } catch (err) {
      console.error("Erreur:", err)
      handleError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAntennes()
  }, [])

  const handleAntenneAdded = (newAntenne) => {
    setAntennesData((prev) => [newAntenne, ...prev])
    setFilteredData((prev) => [newAntenne, ...prev])
  }

  const handleEditClick = (antenne) => {
    setEditingAntenne(antenne)
    setEditMode(true)
    setShowModal(true)
  }

  const handleDeleteClick = async (antenneId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette antenne ?")) {
      try {
        const response = await fetch(`http://localhost:3000/antennes/delete-antenne/${antenneId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression")
        }

        setAntennesData((prev) => prev.filter((antenne) => antenne._id !== antenneId))
        setFilteredData((prev) => prev.filter((antenne) => antenne._id !== antenneId))
        handleSuccess("Antenne supprimée avec succès !")
      } catch (err) {
        handleError(err.message)
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} antenne(s) ?`)) {
      try {
        const deletePromises = selectedItems.map((id) =>
          fetch(`http://localhost:3000/antennes/delete-antenne/${id}`, { method: "DELETE" }),
        )

        await Promise.all(deletePromises)

        setAntennesData((prev) => prev.filter((antenne) => !selectedItems.includes(antenne._id)))
        setFilteredData((prev) => prev.filter((antenne) => !selectedItems.includes(antenne._id)))
        setSelectedItems([])
        handleSuccess(`${selectedItems.length} antenne(s) supprimée(s) avec succès !`)
      } catch (err) {
        handleError("Erreur lors de la suppression multiple")
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

  const itemsPerPage = 10

  // Apply filters and search
  useEffect(() => {
    const filtered = antennesData.filter((antenne) => {
      const matchesSearch =
        antenne.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antenne.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antenne.station?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = !typeFilter || antenne.type === typeFilter
      const matchesEtat = !etatFilter || antenne.etat === etatFilter
      return matchesSearch && matchesType && matchesEtat
    })

    // Sort data
    filtered.sort((a, b) => {
      const getValue = (item, field) => {
        if (field === "station") {
          return item.station?.nom || ""
        }
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
  }, [searchTerm, typeFilter, etatFilter, sortField, sortDirection, antennesData])

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
      setSelectedItems(currentAntennes.map((antenne) => antenne._id))
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
  const currentAntennes = filteredData.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="antenne-crud-loading">
        <div className="antenne-crud-loading-content">
          <div className="antenne-crud-loading-spinner"></div>
          <p className="antenne-crud-loading-text">Chargement des antennes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="antenne-crud">
      <div className="antenne-crud-container">

        {/* Stats Cards - Version compacte */}
        <div className="antenne-crud-stats-compact">
          <div className="antenne-crud-stat-card-compact total">
            <div className="antenne-crud-stat-icon-compact">
              <i className="fas fa-tower-cell"></i>
            </div>
            <div className="antenne-crud-stat-info-compact">
              <dt className="antenne-crud-stat-label-compact">Total Antennes</dt>
              <dd className="antenne-crud-stat-value-compact">{antennesData.length}</dd>
            </div>
          </div>

          <div className="antenne-crud-stat-card-compact active">
            <div className="antenne-crud-stat-icon-compact">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="antenne-crud-stat-info-compact">
              <dt className="antenne-crud-stat-label-compact">Actives</dt>
              <dd className="antenne-crud-stat-value-compact">
                {antennesData.filter((a) => a.etat === "actif").length}
              </dd>
            </div>
          </div>

          <div className="antenne-crud-stat-card-compact fiveg">
            <div className="antenne-crud-stat-icon-compact">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="antenne-crud-stat-info-compact">
              <dt className="antenne-crud-stat-label-compact">5G</dt>
              <dd className="antenne-crud-stat-value-compact">{antennesData.filter((a) => a.type === "5G").length}</dd>
            </div>
          </div>

          <div className="antenne-crud-stat-card-compact maintenance">
            <div className="antenne-crud-stat-icon-compact">
              <i className="fas fa-tools"></i>
            </div>
            <div className="antenne-crud-stat-info-compact">
              <dt className="antenne-crud-stat-label-compact">Maintenance</dt>
              <dd className="antenne-crud-stat-value-compact">
                {antennesData.filter((a) => a.etat === "maintenance").length}
              </dd>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="antenne-crud-filters">
          <div className="antenne-crud-filters-header">
            <div className="antenne-crud-filters-content">
              <div className="antenne-crud-search-container">
                <div className="antenne-crud-search-icon">
                  <i className="fas fa-search"></i>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="antenne-crud-search-input"
                  placeholder="Rechercher par type, fournisseur ou station..."
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="antenne-crud-search-clear">
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              <div className="antenne-crud-filters-row">
                <div className="antenne-crud-filter-group">
                  <label className="antenne-crud-filter-label">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="antenne-crud-select"
                  >
                    <option value="">Tous les types</option>
                    <option value="2G">2G</option>
                    <option value="3G">3G</option>
                    <option value="4G">4G</option>
                    <option value="5G">5G</option>
                    <option value="autres">Autres</option>
                  </select>
                </div>

                <div className="antenne-crud-filter-group">
                  <label className="antenne-crud-filter-label">État</label>
                  <select
                    value={etatFilter}
                    onChange={(e) => setEtatFilter(e.target.value)}
                    className="antenne-crud-select"
                  >
                    <option value="">Tous les états</option>
                    <option value="actif">Actif</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && user?.role === "admin" && (
            <div className="antenne-crud-bulk-actions">
              <div className="antenne-crud-bulk-info">
                <i className="fas fa-check-square"></i>
                <span className="antenne-crud-bulk-text">{selectedItems.length} élément(s) sélectionné(s)</span>
              </div>
              <button onClick={handleBulkDelete} className="antenne-crud-bulk-delete-btn">
                <i className="fas fa-trash"></i>
                Supprimer la sélection
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="antenne-crud-table-container">
          <div className="antenne-crud-table-header">
            <h3 className="antenne-crud-table-title">
              <i className="fas fa-list"></i>
              Liste des Antennes ({filteredData.length})
            </h3>
            <div className="antenne-crud-table-actions">
              {user?.role !== "technicien" && (
                <button
                  onClick={() => {
                    setEditMode(false)
                    setEditingAntenne(null)
                    setShowModal(true)
                  }}
                  className="antenne-crud-add-btn"
                >
                  <i className="fas fa-plus"></i>
                  Nouvelle Antenne
                </button>
              )}
              <button onClick={() => fetchAntennes()} className="antenne-crud-refresh-btn" title="Actualiser">
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <div className="antenne-crud-table-wrapper">
            <table className="antenne-crud-table">
              <thead>
                <tr>
                  {user?.role === "admin" && (
                    <th className="antenne-crud-checkbox-header">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === currentAntennes.length && currentAntennes.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="antenne-crud-checkbox"
                      />
                    </th>
                  )}
                  <th className="antenne-crud-sortable" onClick={() => handleSort("type")}>
                    <div className="antenne-crud-sort-header">
                      <i className="fas fa-signal"></i>
                      <span>Type</span>
                      {sortField === "type" && (
                        <i
                          className={`fas fa-sort-${sortDirection === "desc" ? "down" : "up"} antenne-crud-sort-icon`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th className="antenne-crud-sortable" onClick={() => handleSort("station")}>
                    <div className="antenne-crud-sort-header">
                      <i className="fas fa-building"></i>
                      <span>Station</span>
                      {sortField === "station" && (
                        <i
                          className={`fas fa-sort-${sortDirection === "desc" ? "down" : "up"} antenne-crud-sort-icon`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th className="antenne-crud-sortable" onClick={() => handleSort("frequence")}>
                    <div className="antenne-crud-sort-header">
                      <i className="fas fa-wave-square"></i>
                      <span>Fréquence</span>
                      {sortField === "frequence" && (
                        <i
                          className={`fas fa-sort-${sortDirection === "desc" ? "down" : "up"} antenne-crud-sort-icon`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th className="antenne-crud-sortable" onClick={() => handleSort("fournisseur")}>
                    <div className="antenne-crud-sort-header">
                      <i className="fas fa-industry"></i>
                      <span>Fournisseur</span>
                      {sortField === "fournisseur" && (
                        <i
                          className={`fas fa-sort-${sortDirection === "desc" ? "down" : "up"} antenne-crud-sort-icon`}
                        ></i>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="antenne-crud-sort-header">
                      <i className="fas fa-ruler-vertical"></i>
                      <span>HBA</span>
                    </div>
                  </th>
                  <th>
                    <div className="antenne-crud-sort-header">
                      <i className="fas fa-compass"></i>
                      <span>Orientation</span>
                    </div>
                  </th>
                  <th className="antenne-crud-sortable" onClick={() => handleSort("etat")}>
                    <div className="antenne-crud-sort-header">
                      <i className="fas fa-info-circle"></i>
                      <span>État</span>
                      {sortField === "etat" && (
                        <i
                          className={`fas fa-sort-${sortDirection === "desc" ? "down" : "up"} antenne-crud-sort-icon`}
                        ></i>
                      )}
                    </div>
                  </th>
                  {user?.role !== "technicien" && (
                    <th>
                      <div className="antenne-crud-sort-header">
                        <i className="fas fa-cogs"></i>
                        <span>Actions</span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentAntennes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="antenne-crud-empty">
                      <div className="antenne-crud-empty-content">
                        <i className="fas fa-tower-cell antenne-crud-empty-icon"></i>
                        <p className="antenne-crud-empty-title">Aucune antenne trouvée</p>
                        <p className="antenne-crud-empty-subtitle">
                          {searchTerm || typeFilter || etatFilter
                            ? "Aucun résultat ne correspond à vos critères de recherche"
                            : "Commencez par créer une nouvelle antenne"}
                        </p>
                        {(searchTerm || typeFilter || etatFilter) && (
                          <button
                            onClick={() => {
                              setSearchTerm("")
                              setTypeFilter("")
                              setEtatFilter("")
                            }}
                            className="antenne-crud-clear-filters"
                          >
                            <i className="fas fa-filter"></i>
                            Effacer les filtres
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentAntennes.map((antenne, index) => (
                    <tr key={antenne._id} className="antenne-crud-table-row">
                      {user?.role === "admin" && (
                        <td className="antenne-crud-checkbox-cell">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(antenne._id)}
                            onChange={(e) => handleSelectItem(antenne._id, e.target.checked)}
                            className="antenne-crud-checkbox"
                          />
                        </td>
                      )}
                      <td>
                        <div className="antenne-crud-type-cell">
                          <span className={`antenne-crud-badge type-${antenne.type?.toLowerCase() || "autres"}`}>
                            {antenne.type?.toUpperCase() || "AUTRES"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="antenne-crud-station-name">{antenne.station?.nom || "N/A"}</span>
                      </td>
                      <td>
                        <span className="antenne-crud-frequency-value">
                          {antenne.frequence ? `${antenne.frequence} MHz` : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="antenne-crud-supplier-name">{antenne.fournisseur || "N/A"}</span>
                      </td>
                      <td>
                        <span className="antenne-crud-hba-value">{antenne.HBA ? `${antenne.HBA} m` : "N/A"}</span>
                      </td>
                      <td>
                        <div className="antenne-crud-orientation-values">
                          {antenne.tilt && (
                            <span className="antenne-crud-orientation-item">
                              <small>T:</small> {antenne.tilt}°
                            </span>
                          )}
                          {antenne.azimut && (
                            <span className="antenne-crud-orientation-item">
                              <small>A:</small> {antenne.azimut}°
                            </span>
                          )}
                          {!antenne.tilt && !antenne.azimut && <span>N/A</span>}
                        </div>
                      </td>
                      <td>
                        <div className="antenne-crud-status-cell">
                          <span className={`antenne-crud-badge etat-${antenne.etat}`}>
                            <i
                              className={`fas ${
                                antenne.etat === "actif"
                                  ? "fa-check-circle"
                                  : antenne.etat === "maintenance"
                                    ? "fa-tools"
                                    : "fa-times-circle"
                              }`}
                            ></i>
                            {antenne.etat === "actif"
                              ? "ACTIF"
                              : antenne.etat === "maintenance"
                                ? "MAINTENANCE"
                                : "INACTIF"}
                          </span>
                          {antenne.etat_serrage && (
                            <span className="antenne-crud-badge-small serrage-ok">SERRAGE OK</span>
                          )}
                        </div>
                      </td>
                      {user?.role !== "technicien" && (
                        <td>
                          <div className="antenne-crud-actions">
                            <button
                              onClick={() => handleEditClick(antenne)}
                              className="antenne-crud-action-btn edit"
                              title="Modifier l'antenne"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {user?.role === "admin" && (
                              <button
                                onClick={() => handleDeleteClick(antenne._id)}
                                className="antenne-crud-action-btn delete"
                                title="Supprimer l'antenne"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                            {antenne.observation && (
                              <button
                                className="antenne-crud-action-btn info"
                                title={`Observation: ${antenne.observation}`}
                              >
                                <i className="fas fa-info-circle"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="antenne-crud-pagination">
              <div className="antenne-crud-pagination-info">
                <span>
                  Affichage de <strong>{startIndex + 1}</strong> à{" "}
                  <strong>{Math.min(endIndex, filteredData.length)}</strong> sur <strong>{filteredData.length}</strong>{" "}
                  antennes
                </span>
              </div>
              <div className="antenne-crud-pagination-controls">
                <button
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="antenne-crud-pagination-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                  Précédent
                </button>

                <div className="antenne-crud-pagination-numbers">
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
                        className={`antenne-crud-pagination-btn ${pageNumber === currentPage ? "active" : ""}`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="antenne-crud-pagination-btn"
                >
                  Suivant
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal AddAntenne */}
      <AddAntenne
        showModal={showModal}
        setShowModal={setShowModal}
        onAntenneAdded={handleAntenneAdded}
        onSuccess={handleSuccess}
        onError={handleError}
        editingAntenne={editingAntenne}
        editMode={editMode}
      />

      {/* PopUp */}
      <PopUp type={popup.type} message={popup.message} isVisible={popup.isVisible} onClose={closePopup} />
    </div>
  )
}

export default AntennesList
