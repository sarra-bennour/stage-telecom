"use client"

import { useState, useEffect } from "react"
import AddAntenne from "./addAntenne"
import PopUp from "../partials/popup"
import "./antenne-crud.css"

const AntennesList = () => {
  // State management
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
    // Dans le useEffect qui gère le filtrage et le tri
filtered.sort((a, b) => {
  const getValue = (item, field) => {
    if (field === "station") {
      return item.station?.nom || "";
    }
    return item[field] || "";
  };

  const aValue = String(getValue(a, sortField)).toLowerCase();
  const bValue = String(getValue(b, sortField)).toLowerCase();

  if (sortDirection === "asc") {
    return aValue.localeCompare(bValue);
  } else {
    return bValue.localeCompare(aValue);
  }
});

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
        {/* Header */}
        <div className="antenne-crud-header">
          <div className="antenne-crud-header-content">
            <div>
              <h1 className="antenne-crud-title">Gestion des Antennes</h1>
              <p className="antenne-crud-subtitle">Gérez vos antennes de télécommunication</p>
            </div>
            <div>
              <button
                onClick={() => {
                  setEditMode(false)
                  setEditingAntenne(null)
                  setShowModal(true)
                }}
                className="antenne-crud-add-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle Antenne
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="antenne-crud-stats">
          <div className="antenne-crud-stat-card">
            <div className="antenne-crud-stat-content">
              <div className="antenne-crud-stat-icon total">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
              </div>
              <div className="antenne-crud-stat-info">
                <dt className="antenne-crud-stat-label">Total</dt>
                <dd className="antenne-crud-stat-value">{antennesData.length}</dd>
              </div>
            </div>
          </div>

          <div className="antenne-crud-stat-card">
            <div className="antenne-crud-stat-content">
              <div className="antenne-crud-stat-icon active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="antenne-crud-stat-info">
                <dt className="antenne-crud-stat-label">Actives</dt>
                <dd className="antenne-crud-stat-value">{antennesData.filter((a) => a.etat === "actif").length}</dd>
              </div>
            </div>
          </div>

          <div className="antenne-crud-stat-card">
            <div className="antenne-crud-stat-content">
              <div className="antenne-crud-stat-icon fiveg">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="antenne-crud-stat-info">
                <dt className="antenne-crud-stat-label">5G</dt>
                <dd className="antenne-crud-stat-value">{antennesData.filter((a) => a.type === "5G").length}</dd>
              </div>
            </div>
          </div>

          <div className="antenne-crud-stat-card">
            <div className="antenne-crud-stat-content">
              <div className="antenne-crud-stat-icon maintenance">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="antenne-crud-stat-info">
                <dt className="antenne-crud-stat-label">Maintenance</dt>
                <dd className="antenne-crud-stat-value">
                  {antennesData.filter((a) => a.etat === "maintenance").length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="antenne-crud-filters">
          <div className="antenne-crud-filters-header">
            <div className="antenne-crud-filters-content">
              <div className="antenne-crud-search-container">
                <div className="antenne-crud-search-icon">
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
                  className="antenne-crud-search-input"
                  placeholder="Rechercher une antenne..."
                />
              </div>

              <div className="antenne-crud-filters-row">
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

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="antenne-crud-bulk-actions">
              <span className="antenne-crud-bulk-text">{selectedItems.length} élément(s) sélectionné(s)</span>
              <button onClick={handleBulkDelete} className="antenne-crud-bulk-delete-btn">
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

        {/* Table */}
        <div className="antenne-crud-table-container">
          <div className="antenne-crud-table-wrapper">
            <table className="antenne-crud-table">
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === currentAntennes.length && currentAntennes.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="antenne-crud-checkbox"
                    />
                  </th>
                  <th className="sortable" onClick={() => handleSort("type")}>
                    <div className="sort-header">
                      <span>Type</span>
                      {sortField === "type" && (
                        <svg
                          className={`sort-icon ${sortDirection === "desc" ? "desc" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort("station")}>
                    <div className="sort-header">
                      <span>Station</span>
                      {sortField === "station" && (
                        <svg
                          className={`sort-icon ${sortDirection === "desc" ? "desc" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort("frequence")}>
                    <div className="sort-header">
                      <span>Fréquence</span>
                      {sortField === "frequence" && (
                        <svg
                          className={`sort-icon ${sortDirection === "desc" ? "desc" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort("fournisseur")}>
                    <div className="sort-header">
                      <span>Fournisseur</span>
                      {sortField === "fournisseur" && (
                        <svg
                          className={`sort-icon ${sortDirection === "desc" ? "desc" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort("etat")}>
                    <div className="sort-header">
                      <span>État</span>
                      {sortField === "etat" && (
                        <svg
                          className={`sort-icon ${sortDirection === "desc" ? "desc" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAntennes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="antenne-crud-empty">
                      <div className="antenne-crud-empty-content">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                          />
                        </svg>
                        <p className="antenne-crud-empty-title">Aucune antenne trouvée</p>
                        <p className="antenne-crud-empty-subtitle">Commencez par créer une nouvelle antenne</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentAntennes.map((antenne) => (
                    <tr key={antenne._id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(antenne._id)}
                          onChange={(e) => handleSelectItem(antenne._id, e.target.checked)}
                          className="antenne-crud-checkbox"
                        />
                      </td>
                      <td>
                        <span className={`antenne-crud-badge type-${antenne.type?.toLowerCase() || "autres"}`}>
                          {antenne.type}
                        </span>
                      </td>
                      <td>{antenne.station?.nom || "N/A"}</td>
                      <td>{antenne.frequence ? `${antenne.frequence} MHz` : "N/A"}</td>
                      <td>{antenne.fournisseur || "N/A"}</td>
                      <td>
                        <span className={`antenne-crud-badge etat-${antenne.etat}`}>
                          {antenne.etat === "actif"
                            ? "Actif"
                            : antenne.etat === "maintenance"
                              ? "Maintenance"
                              : "Inactif"}
                        </span>
                      </td>
                      <td>
                        <div className="antenne-crud-actions">
                          <button
                            onClick={() => handleEditClick(antenne)}
                            className="antenne-crud-action-btn edit"
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
                          <button
                            onClick={() => handleDeleteClick(antenne._id)}
                            className="antenne-crud-action-btn delete"
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="antenne-crud-pagination">
              <div className="antenne-crud-pagination-mobile">
                <button
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="antenne-crud-pagination-btn"
                >
                  Précédent
                </button>
                <button
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="antenne-crud-pagination-btn"
                >
                  Suivant
                </button>
              </div>
              <div className="antenne-crud-pagination-desktop">
                <div>
                  <p className="antenne-crud-pagination-info">
                    Affichage de <span className="font-medium">{startIndex + 1}</span> à{" "}
                    <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> sur{" "}
                    <span className="font-medium">{filteredData.length}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="antenne-crud-pagination-nav">
                    <button
                      onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="antenne-crud-pagination-btn"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`antenne-crud-pagination-btn ${page === currentPage ? "active" : ""}`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="antenne-crud-pagination-btn"
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
