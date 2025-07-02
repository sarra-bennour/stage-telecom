"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AddDerangement = ({
  showModal,
  setShowModal,
  onDerangementAdded,
  onSuccess,
  onError,
  editingDerangement,
  editMode,
}) => {
  const [formData, setFormData] = useState({
    type: "",
    priorite: "moyenne",
    description: "",
    date_occurrence: "",
    ticket: "",
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  // Fetch tickets for dropdown
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true)
      const response = await axios.get("http://localhost:3000/tickets/ticket-list", {
        withCredentials: true,
      })
      setTickets(response.data.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error)
      setTickets([])
    } finally {
      setLoadingTickets(false)
    }
  }

  // Reset form when modal opens/closes or when switching between add/edit modes
  useEffect(() => {
    if (showModal) {
      fetchTickets()

      if (editMode && editingDerangement) {
        // Populate form with existing derangement data
        setFormData({
          type: editingDerangement.type || "",
          priorite: editingDerangement.priorite || "moyenne",
          description: editingDerangement.description || "",
          date_occurrence: editingDerangement.date_occurrence
            ? new Date(editingDerangement.date_occurrence).toISOString().slice(0, 16)
            : "",
          ticket: editingDerangement.ticket || "",
        })
      } else {
        // Reset form for new derangement
        setFormData({
          type: "",
          priorite: "moyenne",
          description: "",
          date_occurrence: new Date().toISOString().slice(0, 16), // Current date/time
          ticket: "",
        })
      }
      setErrors({})
    }
  }, [showModal, editMode, editingDerangement])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.type.trim()) {
      newErrors.type = "Le type de dérangement est requis"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise"
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "La description doit contenir au moins 10 caractères"
    }

    if (!formData.ticket) {
      newErrors.ticket = "Un ticket doit être sélectionné"
    }

    if (!formData.date_occurrence) {
      newErrors.date_occurrence = "La date d'occurrence est requise"
    } else {
      const occurrenceDate = new Date(formData.date_occurrence)
      const now = new Date()
      if (occurrenceDate > now) {
        newErrors.date_occurrence = "La date d'occurrence ne peut pas être dans le futur"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        date_occurrence: formData.date_occurrence ? new Date(formData.date_occurrence).toISOString() : undefined,
      }

      // Remove empty fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === undefined) {
          delete submitData[key]
        }
      })

      let response
      if (editMode && editingDerangement) {
        // Update existing derangement
        response = await axios.put(
          `http://localhost:3000/derangements/update-derangement/${editingDerangement._id}`,
          submitData,
          {
            withCredentials: true,
          },
        )
        onSuccess("Dérangement modifié avec succès !")
      } else {
        // Create new derangement
        response = await axios.post("http://localhost:3000/derangements/create-derangement", submitData, {
          withCredentials: true,
        })
        onSuccess("Dérangement créé avec succès !")
      }

      if (response.data && response.data.data) {
        onDerangementAdded(response.data.data)
      }

      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Erreur:", error)
      const errorMessage =
        error.response?.data?.message || error.message || "Une erreur est survenue lors de l'enregistrement"
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: "",
      priorite: "moyenne",
      description: "",
      date_occurrence: "",
      ticket: "",
    })
    setErrors({})
  }

  const handleClose = () => {
    setShowModal(false)
    resetForm()
  }

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
      faible: "#10b981",
      moyenne: "#f59e0b",
      haute: "#ef4444",
    }
    return colors[priorite] || "#f59e0b"
  }

  if (!showModal) return null

  return (
    <div className="derangement-form-overlay">
      <div className="derangement-form-modal">
        <div className="derangement-form-header">
          <h3 className="derangement-form-title">
            <i className="fas fa-exclamation-triangle derangement-form-title-icon"></i>
            {editMode ? "Modifier le dérangement" : "Nouveau dérangement"}
          </h3>
          <button onClick={handleClose} className="derangement-form-close-btn" type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="derangement-form-content">
          <div className="derangement-form-grid">
            {/* Type */}
            <div className="derangement-form-field">
              <label htmlFor="type" className="derangement-form-label">
                <i className="fas fa-tags"></i>
                Type de dérangement <span className="derangement-form-required">*</span>
              </label>
              <div className="derangement-form-select-container">
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`derangement-form-select ${errors.type ? "derangement-form-error" : ""}`}
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="énergie">⚡ Énergie</option>
                  <option value="environnement">🌿 Environnement</option>
                  <option value="transmission">📡 Transmission</option>
                  <option value="hardware">🔧 Hardware</option>
                  <option value="software">💻 Software</option>
                  <option value="qualité">⭐ Qualité</option>
                </select>
                {formData.type && (
                  <div className="derangement-form-type-preview">
                    <i className={getTypeIcon(formData.type)}></i>
                    <span>{formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}</span>
                  </div>
                )}
              </div>
              {errors.type && <span className="derangement-form-error-text">{errors.type}</span>}
            </div>

            {/* Priorité */}
            <div className="derangement-form-field">
              <label htmlFor="priorite" className="derangement-form-label">
                <i className="fas fa-flag"></i>
                Priorité <span className="derangement-form-required">*</span>
              </label>
              <div className="derangement-form-select-container">
                <select
                  id="priorite"
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleInputChange}
                  className="derangement-form-select"
                  required
                >
                  <option value="faible">🟢 Faible</option>
                  <option value="moyenne">🟡 Moyenne</option>
                  <option value="haute">🔴 Haute</option>
                </select>
                <div
                  className="derangement-form-priority-indicator"
                  style={{ backgroundColor: getPriorityColor(formData.priorite) }}
                ></div>
              </div>
            </div>

            {/* Date d'occurrence */}
            <div className="derangement-form-field">
              <label htmlFor="date_occurrence" className="derangement-form-label">
                <i className="fas fa-calendar-alt"></i>
                Date et heure d'occurrence <span className="derangement-form-required">*</span>
              </label>
              <input
                type="datetime-local"
                id="date_occurrence"
                name="date_occurrence"
                value={formData.date_occurrence}
                onChange={handleInputChange}
                className={`derangement-form-input ${errors.date_occurrence ? "derangement-form-error" : ""}`}
                max={new Date().toISOString().slice(0, 16)}
                required
              />
              {errors.date_occurrence && <span className="derangement-form-error-text">{errors.date_occurrence}</span>}
            </div>

            {/* Ticket */}
            <div className="derangement-form-field">
              <label htmlFor="ticket" className="derangement-form-label">
                <i className="fas fa-ticket-alt"></i>
                Ticket associé <span className="derangement-form-required">*</span>
              </label>
              <div className="derangement-form-select-container">
                <select
                  id="ticket"
                  name="ticket"
                  value={formData.ticket}
                  onChange={handleInputChange}
                  className={`derangement-form-select ${errors.ticket ? "derangement-form-error" : ""}`}
                  required
                  disabled={loadingTickets}
                >
                  <option value="">{loadingTickets ? "Chargement des tickets..." : "Sélectionner un ticket"}</option>
                  {tickets.map((ticket) => (
                    <option key={ticket._id} value={ticket._id}>
                      #{ticket.numero || ticket._id.slice(-6)} - {ticket.titre || "Sans titre"}
                      {ticket.statut && ` (${ticket.statut})`}
                    </option>
                  ))}
                </select>
                {loadingTickets && (
                  <div className="derangement-form-loading-indicator">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </div>
              {errors.ticket && <span className="derangement-form-error-text">{errors.ticket}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="derangement-form-field derangement-form-full-width">
            <label htmlFor="description" className="derangement-form-label">
              <i className="fas fa-file-alt"></i>
              Description détaillée <span className="derangement-form-required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`derangement-form-textarea ${errors.description ? "derangement-form-error" : ""}`}
              placeholder="Décrivez en détail le problème rencontré, les symptômes observés, les conditions d'occurrence, etc."
              rows="6"
              required
            />
            <div className="derangement-form-textarea-info">
              <span className={`derangement-form-char-count ${formData.description.length < 10 ? "insufficient" : ""}`}>
                {formData.description.length} caractères (minimum 10)
              </span>
              <span className="derangement-form-textarea-hint">Soyez précis pour faciliter la résolution</span>
            </div>
            {errors.description && <span className="derangement-form-error-text">{errors.description}</span>}
          </div>

          {/* Preview Section */}
          {(formData.type || formData.description) && (
            <div className="derangement-form-preview">
              <h4 className="derangement-form-preview-title">
                <i className="fas fa-eye"></i>
                Aperçu
              </h4>
              <div className="derangement-form-preview-content">
                <div className="derangement-form-preview-header">
                  {formData.type && (
                    <span className={`derangement-form-preview-type type-${formData.type}`}>
                      <i className={getTypeIcon(formData.type)}></i>
                      {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                    </span>
                  )}
                  <span className={`derangement-form-preview-priority priority-${formData.priorite}`}>
                    <i className="fas fa-flag"></i>
                    {formData.priorite.charAt(0).toUpperCase() + formData.priorite.slice(1)}
                  </span>
                </div>
                {formData.description && <p className="derangement-form-preview-description">{formData.description}</p>}
                {formData.date_occurrence && (
                  <div className="derangement-form-preview-date">
                    <i className="fas fa-clock"></i>
                    {new Date(formData.date_occurrence).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="derangement-form-buttons">
            <button type="button" onClick={handleClose} className="derangement-form-btn-cancel">
              <i className="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" disabled={loading} className="derangement-form-btn-submit">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {editMode ? "Modification..." : "Création..."}
                </>
              ) : (
                <>
                  <i className={`fas ${editMode ? "fa-save" : "fa-plus"}`}></i>
                  {editMode ? "Modifier" : "Créer"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDerangement
