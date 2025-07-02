"use client"

import { useState, useEffect } from "react"
import "./ticket-crud.css"

const AddTicket = ({ showModal, setShowModal, onTicketAdded, onSuccess, onError, editingTicket, editMode }) => {
  const [formData, setFormData] = useState({
    statut: "ouvert",
    description_resolution: "",
    superviseur_id: "",
    technicien_id: "",
    date_cloture: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState([])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showModal) {
      if (editMode && editingTicket) {
        setFormData({
          statut: editingTicket.statut || "ouvert",
          description_resolution: editingTicket.description_resolution || "",
          superviseur_id: editingTicket.superviseur_id || "",
          technicien_id: editingTicket.technicien_id || "",
          date_cloture: editingTicket.date_cloture
            ? new Date(editingTicket.date_cloture).toISOString().split("T")[0]
            : "",
        })
      } else {
        setFormData({
          statut: "ouvert",
          description_resolution: "",
          superviseur_id: "",
          technicien_id: "",
          date_cloture: "",
        })
      }
      setErrors({})
      fetchUsers()
    }
  }, [showModal, editMode, editingTicket])

  const fetchUsers = async () => {
    try {
      // Récupérer les superviseurs
      const superviseurResponse = await fetch("http://localhost:3000/users/get-superviseur")
      const technicienResponse = await fetch("http://localhost:3000/users/get-technicien")

      let allUsers = []

      if (superviseurResponse.ok) {
        const superviseurData = await superviseurResponse.json()
        const superviseurs = (superviseurData.data || []).map((user) => ({ ...user, role: "superviseur" }))
        allUsers = [...allUsers, ...superviseurs]
      }

      if (technicienResponse.ok) {
        const technicienData = await technicienResponse.json()
        const techniciens = (technicienData.data || []).map((user) => ({ ...user, role: "technicien" }))
        allUsers = [...allUsers, ...techniciens]
      }

      setUsers(allUsers)
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    }
  }

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

    if (!formData.description_resolution.trim()) {
      newErrors.description_resolution = "La description est requise"
    }

    if (!formData.superviseur_id.trim()) {
      newErrors.superviseur_id = "Le superviseur est requis"
    }

    if (!formData.technicien_id.trim()) {
      newErrors.technicien_id = "Le technicien est requis"
    }

    if (formData.statut === "résolu" && !formData.date_cloture) {
      newErrors.date_cloture = "La date de clôture est requise pour un ticket résolu"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        date_cloture: formData.date_cloture || null,
      }

      const url = editMode
        ? `http://localhost:3000/tickets/update-ticket/${editingTicket._id}`
        : "http://localhost:3000/tickets/create-ticket"

      const method = editMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement")
      }

      const result = await response.json()

      if (editMode) {
        onSuccess("Ticket modifié avec succès !")
      } else {
        onTicketAdded(result.data)
        onSuccess("Ticket créé avec succès !")
      }

      setShowModal(false)
    } catch (error) {
      onError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setFormData({
      statut: "ouvert",
      description_resolution: "",
      superviseur_id: "",
      technicien_id: "",
      date_cloture: "",
    })
    setErrors({})
  }

  if (!showModal) return null

  return (
    <div className="ticket-modal-overlay" onClick={handleClose}>
      <div className="ticket-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-modal-header">
          <div className="ticket-modal-title-section">
            <i className="fas fa-ticket-alt ticket-modal-icon"></i>
            <h2 className="ticket-modal-title">{editMode ? "Modifier le Ticket" : "Nouveau Ticket de Panne"}</h2>
          </div>
          <button onClick={handleClose} className="ticket-modal-close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ticket-modal-form">
          <div className="ticket-form-grid">
            {/* Status */}
            <div className="ticket-form-group full-width">
              <label className="ticket-form-label">
                <i className="fas fa-info-circle"></i>
                Statut du Ticket
              </label>
              <div className="ticket-status-selector">
                <div className="ticket-status-options">
                  <label className={`ticket-status-option ${formData.statut === "ouvert" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="statut"
                      value="ouvert"
                      checked={formData.statut === "ouvert"}
                      onChange={handleInputChange}
                    />
                    <div className="ticket-status-content">
                      <i className="fas fa-exclamation-circle status-icon danger"></i>
                      <span>Ouvert</span>
                    </div>
                  </label>

                  <label className={`ticket-status-option ${formData.statut === "en_cours" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="statut"
                      value="en_cours"
                      checked={formData.statut === "en_cours"}
                      onChange={handleInputChange}
                    />
                    <div className="ticket-status-content">
                      <i className="fas fa-clock status-icon warning"></i>
                      <span>En Cours</span>
                    </div>
                  </label>

                  <label className={`ticket-status-option ${formData.statut === "résolu" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="statut"
                      value="résolu"
                      checked={formData.statut === "résolu"}
                      onChange={handleInputChange}
                    />
                    <div className="ticket-status-content">
                      <i className="fas fa-check-circle status-icon success"></i>
                      <span>Résolu</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="ticket-form-group full-width">
              <label className="ticket-form-label">
                <i className="fas fa-file-alt"></i>
                Description de la Panne
              </label>
              <textarea
                name="description_resolution"
                value={formData.description_resolution}
                onChange={handleInputChange}
                className={`ticket-form-textarea ${errors.description_resolution ? "error" : ""}`}
                placeholder="Décrivez en détail la panne rencontrée..."
                rows="4"
              />
              {errors.description_resolution && (
                <span className="ticket-form-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  {errors.description_resolution}
                </span>
              )}
            </div>

            {/* Superviseur */}
            <div className="ticket-form-group">
              <label className="ticket-form-label">
                <i className="fas fa-user-tie"></i>
                Superviseur Responsable
              </label>
              <select
                name="superviseur_id"
                value={formData.superviseur_id}
                onChange={handleInputChange}
                className={`ticket-form-select ${errors.superviseur_id ? "error" : ""}`}
              >
                <option value="">Sélectionner un superviseur</option>
                {users
                  .filter((user) => user.role === "superviseur" || user.role === "admin")
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.nom} {user.prenom} - {user.email}
                    </option>
                  ))}
              </select>
              {errors.superviseur_id && (
                <span className="ticket-form-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  {errors.superviseur_id}
                </span>
              )}
            </div>

            {/* Technicien */}
            <div className="ticket-form-group">
              <label className="ticket-form-label">
                <i className="fas fa-user-cog"></i>
                Technicien Assigné
              </label>
              <select
                name="technicien_id"
                value={formData.technicien_id}
                onChange={handleInputChange}
                className={`ticket-form-select ${errors.technicien_id ? "error" : ""}`}
              >
                <option value="">Sélectionner un technicien</option>
                {users
                  .filter((user) => user.role === "technicien" || user.role === "admin")
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.nom} {user.prenom} - {user.email}
                    </option>
                  ))}
              </select>
              {errors.technicien_id && (
                <span className="ticket-form-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  {errors.technicien_id}
                </span>
              )}
            </div>

            {/* Date de clôture - Only show if status is resolved */}
            {formData.statut === "résolu" && (
              <div className="ticket-form-group full-width">
                <label className="ticket-form-label">
                  <i className="fas fa-calendar-check"></i>
                  Date de Clôture
                </label>
                <input
                  type="date"
                  name="date_cloture"
                  value={formData.date_cloture}
                  onChange={handleInputChange}
                  className={`ticket-form-input ${errors.date_cloture ? "error" : ""}`}
                />
                {errors.date_cloture && (
                  <span className="ticket-form-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    {errors.date_cloture}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="ticket-modal-footer">
            <button type="button" onClick={handleClose} className="ticket-btn-secondary">
              <i className="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="ticket-btn-primary">
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {editMode ? "Modification..." : "Création..."}
                </>
              ) : (
                <>
                  <i className={`fas ${editMode ? "fa-save" : "fa-plus"}`}></i>
                  {editMode ? "Modifier le Ticket" : "Créer le Ticket"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTicket
