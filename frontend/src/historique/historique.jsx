"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./historique.css"

const Historique = () => {
  // State management
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [historiqueData, setHistoriqueData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [entityFilter, setEntityFilter] = useState("")
  const [userFilter, setUserFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/users/check-auth", {
          withCredentials: true,
        })
        const currentUser = response.data.data?.user
        setUser(currentUser)
        console.log('User from response:', currentUser)
      } catch (error) {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])
  
  // Fetch historique from backend
  const fetchHistorique = async () => {
    try {
      setLoading(true);
      
      // Vérifier que user est défini avant de faire la requête
      if (!user?._id || !user?.role) {
        console.log('User not defined yet, skipping fetch')
        return
      }
      
      const response = await fetch("http://localhost:3000/historique/", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          userRole: user.role
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }

      const data = await response.json();
      setHistoriqueData(data.data || []);
      setFilteredData(data.data || []);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Appeler fetchHistorique quand user change
  useEffect(() => {
    if (user && !authLoading) {
      fetchHistorique()
    }
  }, [user, authLoading]) // Dépend de user et authLoading


  const itemsPerPage = 8

  // Apply filters and search
  useEffect(() => {
    const filtered = historiqueData.filter((item) => {
      const matchesSearch = 
        item.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesAction = !actionFilter || item.action === actionFilter
      const matchesEntity = !entityFilter || item.entity === entityFilter
      const matchesUser = !userFilter || item.user?._id === userFilter
      
      let matchesDate = true
      if (dateFilter) {
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0]
        matchesDate = itemDate === dateFilter
      }
      
      return matchesSearch && matchesAction && matchesEntity && matchesUser && matchesDate
    })

    // Sort data
    filtered.sort((a, b) => {
      const getValue = (item, field) => {
        if (field === "user") {
          return item.user?.nom || item.user?.email || ""
        }
        if (field === "createdAt") {
          return new Date(item.createdAt).getTime()
        }
        return item[field] || ""
      }

      const aValue = getValue(a, sortField)
      const bValue = getValue(b, sortField)

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, actionFilter, entityFilter, userFilter, dateFilter, sortField, sortDirection, historiqueData])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentHistorique = filteredData.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  // Get unique values for filters
  const uniqueActions = [...new Set(historiqueData.map(item => item.action).filter(Boolean))]
  const uniqueEntities = [...new Set(historiqueData.map(item => item.entity).filter(Boolean))]
  const uniqueUsers = [...new Set(historiqueData.map(item => item.user).filter(Boolean))]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1).toDateString()
    const d2 = new Date(date2).toDateString()
    return d1 === d2
  }

  const formatRelativeTime = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Il y a quelques secondes'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`
    return formatDate(dateString)
  }

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'créer':
        return 'fa-plus-circle'
      case 'update':
      case 'modifier':
        return 'fa-edit'
      case 'delete':
      case 'supprimer':
        return 'fa-trash'
      case 'login':
      case 'connexion':
        return 'fa-sign-in-alt'
      case 'logout':
      case 'déconnexion':
        return 'fa-sign-out-alt'
      default:
        return 'fa-history'
    }
  }

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'créer':
        return 'success'
      case 'update':
      case 'modifier':
        return 'warning'
      case 'delete':
      case 'supprimer':
        return 'danger'
      case 'login':
      case 'connexion':
        return 'info'
      case 'logout':
      case 'déconnexion':
        return 'secondary'
      default:
        return 'primary'
    }
  }

  const getEntityIcon = (entity) => {
    switch (entity?.toLowerCase()) {
      case 'antenne':
      case 'antennes':
        return 'fa-tower-cell'
      case 'station':
      case 'stations':
        return 'fa-building'
      case 'user':
      case 'utilisateur':
        return 'fa-user'
      default:
        return 'fa-cube'
    }
  }

  if (loading) {
    return (
      <div className="historique-loading">
        <div className="historique-loading-content">
          <div className="historique-loading-spinner"></div>
          <p className="historique-loading-text">Chargement de l'historique...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="historique">
      <div className="historique-container">

        {/* Header avec informations générales */}
        <div className="historique-header">
          <div className="historique-header-content">
            <div className="historique-header-info">
              <h1 className="historique-title">
                <i className="fas fa-history historique-title-icon"></i>
                Historique des Actions
              </h1>
              <p className="historique-subtitle">
                Suivi complet de toutes les activités du système
              </p>
            </div>
            <div className="historique-header-stats">
              <div className="historique-quick-stat">
                <span className="historique-quick-stat-value">{historiqueData.length}</span>
                <span className="historique-quick-stat-label">Total</span>
              </div>
              <div className="historique-quick-stat">
                <span className="historique-quick-stat-value">
                  {historiqueData.filter(item => {
                    const today = new Date().toISOString().split('T')[0]
                    const itemDate = new Date(item.createdAt).toISOString().split('T')[0]
                    return itemDate === today
                  }).length}
                </span>
                <span className="historique-quick-stat-label">Aujourd'hui</span>
              </div>
              <div className="historique-quick-stat">
                <span className="historique-quick-stat-value">
                  {new Set(historiqueData.map(item => item.user?._id).filter(Boolean)).size}
                </span>
                <span className="historique-quick-stat-label">Utilisateurs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="historique-filters">
          <div className="historique-filters-header">
            <div className="historique-filters-content">
              <div className="historique-search-container">
                <div className="historique-search-icon">
                  <i className="fas fa-search"></i>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="historique-search-input"
                  placeholder="Rechercher par action, entité ou utilisateur..."
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="historique-search-clear">
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              <div className="historique-filters-row">
                <div className="historique-filter-group">
                  <label className="historique-filter-label">Action</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="historique-select"
                  >
                    <option value="">Toutes les actions</option>
                    {uniqueActions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>

                <div className="historique-filter-group">
                  <label className="historique-filter-label">Entité</label>
                  <select
                    value={entityFilter}
                    onChange={(e) => setEntityFilter(e.target.value)}
                    className="historique-select"
                  >
                    <option value="">Toutes les entités</option>
                    {uniqueEntities.map(entity => (
                      <option key={entity} value={entity}>{entity}</option>
                    ))}
                  </select>
                </div>

                <div className="historique-filter-group">
                  <label className="historique-filter-label">Utilisateur</label>
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="historique-select"
                  >
                    <option value="">Tous les utilisateurs</option>
                    {uniqueUsers.map(userItem => (
                      <option key={userItem._id} value={userItem._id}>
                        {userItem.nom || userItem.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="historique-filter-group">
                  <label className="historique-filter-label">Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="historique-select"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Feed */}
        <div className="historique-feed-container">
          <div className="historique-feed-header">
            <h3 className="historique-feed-title">
              <i className="fas fa-stream"></i>
              Flux d'activité ({filteredData.length})
            </h3>
            <div className="historique-feed-actions">
              <button
                onClick={fetchHistorique}
                className="historique-refresh-btn"
                title="Actualiser"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          {currentHistorique.length === 0 ? (
            <div className="historique-empty">
              <div className="historique-empty-content">
                <i className="fas fa-history historique-empty-icon"></i>
                <p className="historique-empty-title">Aucun historique trouvé</p>
                <p className="historique-empty-subtitle">
                  {searchTerm || actionFilter || entityFilter || userFilter || dateFilter
                    ? "Aucun résultat ne correspond à vos critères de recherche"
                    : "Aucune action n'a encore été enregistrée"}
                </p>
                {(searchTerm || actionFilter || entityFilter || userFilter || dateFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setActionFilter("")
                      setEntityFilter("")
                      setUserFilter("")
                      setDateFilter("")
                    }}
                    className="historique-clear-filters"
                  >
                    <i className="fas fa-filter"></i>
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="historique-timeline">
              {currentHistorique.map((item, index) => {
                const showDateSeparator = index === 0 || !isSameDay(item.createdAt, currentHistorique[index - 1].createdAt)
                
                return (
                  <div key={item._id}>
                    {showDateSeparator && (
                      <div className="historique-date-separator">
                        <div className="historique-date-line"></div>
                        <div className="historique-date-badge">
                          <i className="fas fa-calendar-alt"></i>
                          {formatDateOnly(item.createdAt)}
                        </div>
                        <div className="historique-date-line"></div>
                      </div>
                    )}
                    
                    <div className="historique-timeline-item">
                      <div className="historique-timeline-connector">
                        <div className="historique-timeline-line"></div>
                        <div className={`historique-timeline-dot ${getActionColor(item.action)}`}>
                          <div className="historique-timeline-dot-inner">
                            <i className={`fas ${getActionIcon(item.action)}`}></i>
                          </div>
                          <div className="historique-timeline-dot-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="historique-activity-card">
                        <div className="historique-card-header">
                          <div className="historique-card-action">
                            <div className="historique-action-info">
                              <div className="historique-action-main">
                                <span className={`historique-action-badge ${getActionColor(item.action)}`}>
                                  <i className={`fas ${getActionIcon(item.action)}`}></i>
                                  {item.action}
                                </span>
                                <div className="historique-action-description">
                                  <span className="historique-action-text">
                                    {item.action.toLowerCase().includes('create') || item.action.toLowerCase().includes('créer') ? 'a créé' :
                                     item.action.toLowerCase().includes('update') || item.action.toLowerCase().includes('modifier') ? 'a modifié' :
                                     item.action.toLowerCase().includes('delete') || item.action.toLowerCase().includes('supprimer') ? 'a supprimé' :
                                     'a effectué une action sur'}
                                  </span>
                                  <div className="historique-entity-info">
                                    <i className={`fas ${getEntityIcon(item.entity)} historique-entity-icon`}></i>
                                    <span className="historique-entity-name">{item.entity}</span>
                                    {item.entityId && (
                                      <span className="historique-entity-id">#{item.entityId.slice(-6)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="historique-card-time">
                            <span className="historique-relative-time">{formatRelativeTime(item.createdAt)}</span>
                            <span className="historique-exact-time">{new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div className="historique-card-content">
                          <div className="historique-user-info">
                            <div className="historique-user-avatar">
                              <i className="fas fa-user"></i>
                            </div>
                            <div className="historique-user-details">
                              <span className="historique-user-name">
                                {item.user?.nom || item.user?.email || "Utilisateur inconnu"}
                              </span>
                              {item.user?.role && (
                                <span className={`historique-user-role role-${item.user.role}`}>
                                  <i className="fas fa-shield-alt"></i>
                                  {item.user.role}
                                </span>
                              )}
                            </div>
                          </div>
                              
                          {item.details && Object.keys(item.details).length > 0 && (
                            <div className="historique-details-section">
                              <button 
                                className="historique-details-toggle"
                                onClick={() => {
                                  const detailsEl = document.getElementById(`details-${item._id}`)
                                  const toggleBtn = document.querySelector(`[onclick*="details-${item._id}"]`)
                                  const isHidden = detailsEl.style.display === 'none' || !detailsEl.style.display
                                  detailsEl.style.display = isHidden ? 'block' : 'none'
                                  toggleBtn.querySelector('i').className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down'
                                }}
                              >
                                <i className="fas fa-chevron-down"></i>
                                <span>Détails techniques</span>
                                <div className="historique-details-count">
                                  {Object.keys(item.details).length} propriété{Object.keys(item.details).length > 1 ? 's' : ''}
                                </div>
                              </button>
                              <div id={`details-${item._id}`} className="historique-details-content" style={{display: 'none'}}>
                                <div className="historique-details-grid">
                                  {Object.entries(item.details).map(([key, value]) => (
                                    <div key={key} className="historique-detail-item">
                                      <span className="historique-detail-key">{key}:</span>
                                      <span className="historique-detail-value">
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <br />
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="historique-pagination">
              <div className="historique-pagination-info">
                <span>
                  Affichage de <strong>{startIndex + 1}</strong> à{" "}
                  <strong>{Math.min(endIndex, filteredData.length)}</strong> sur <strong>{filteredData.length}</strong>{" "}
                  actions
                </span>
              </div>
              <div className="historique-pagination-controls">
                <button
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="historique-pagination-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                  Précédent
                </button>

                <div className="historique-pagination-numbers">
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
                        className={`historique-pagination-btn ${pageNumber === currentPage ? "active" : ""}`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="historique-pagination-btn"
                >
                  Suivant
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Historique
