"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AddTransmission = ({
  showModal,
  setShowModal,
  onTransmissionAdded,
  onSuccess,
  onError,
  editingTransmission,
  editMode,
  currentUserId
}) => {
  const [formData, setFormData] = useState({
    type: "",
    configuration: "",
    debit: "",
    fournisseur: "",
    observation: "",
    date_installation: "",
    date_derniere_maintenance: "",
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Reset form when modal opens/closes or when switching between add/edit modes
  useEffect(() => {
    if (showModal) {
      if (editMode && editingTransmission) {
        // Populate form with existing transmission data
        setFormData({
          type: editingTransmission.type || "",
          configuration: editingTransmission.configuration || "",
          debit: editingTransmission.debit || "",
          fournisseur: editingTransmission.fournisseur || "",
          observation: editingTransmission.observation || "",
          date_installation: editingTransmission.date_installation
            ? new Date(editingTransmission.date_installation).toISOString().split("T")[0]
            : "",
          date_derniere_maintenance: editingTransmission.date_derniere_maintenance
            ? new Date(editingTransmission.date_derniere_maintenance).toISOString().split("T")[0]
            : "",
        })
      } else {
        // Reset form for new transmission
        setFormData({
          type: "",
          configuration: "",
          debit: "",
          fournisseur: "",
          observation: "",
          date_installation: "",
          date_derniere_maintenance: "",
        })
      }
      setErrors({})
    }
  }, [showModal, editMode, editingTransmission])

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
      newErrors.type = "Le type est requis"
    }

    if (formData.debit && (isNaN(formData.debit) || Number(formData.debit) <= 0)) {
      newErrors.debit = "Le débit doit être un nombre positif"
    }

    if (formData.date_installation && formData.date_derniere_maintenance) {
      const installDate = new Date(formData.date_installation)
      const maintenanceDate = new Date(formData.date_derniere_maintenance)
      if (maintenanceDate < installDate) {
        newErrors.date_derniere_maintenance = "La date de maintenance ne peut pas être antérieure à l'installation"
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
        debit: formData.debit ? Number(formData.debit) : undefined,
        date_installation: formData.date_installation || undefined,
        date_derniere_maintenance: formData.date_derniere_maintenance || undefined,
        createdBy: currentUserId
      }

      if (currentUserId) {
        submitData.createdBy = currentUserId;
      }

      // Remove empty fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === undefined) {
          delete submitData[key]
        }
      })

      let response
      if (editMode && editingTransmission) {
        // Update existing transmission
        response = await axios.put(
          `http://localhost:3000/transmissions/update-transmission/${editingTransmission._id}`,
          submitData,
          {
            withCredentials: true,
          },
        )
        onSuccess("Transmission modifiée avec succès !")
      } else {
        // Create new transmission
        response = await axios.post("http://localhost:3000/transmissions/create-transmission", submitData, {
          withCredentials: true,
        })
        onSuccess("Transmission créée avec succès !")
      }

      if (response.data && response.data.data) {
        onTransmissionAdded(response.data.data)
      }

      setShowModal(false)
      setFormData({
        type: "",
        configuration: "",
        debit: "",
        fournisseur: "",
        observation: "",
        date_installation: "",
        date_derniere_maintenance: "",
      })
    } catch (error) {
      console.error("Erreur:", error)
      const errorMessage =
        error.response?.data?.message || error.message || "Une erreur est survenue lors de l'enregistrement"
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setFormData({
      type: "",
      configuration: "",
      debit: "",
      fournisseur: "",
      observation: "",
      date_installation: "",
      date_derniere_maintenance: "",
    })
    setErrors({})
  }

  if (!showModal) return null

  return (
    <div className="transmission-form-overlay">
      <div className="transmission-form-modal">
        <div className="transmission-form-header">
          <h3 className="transmission-form-title">
            <i className="fas fa-network-wired transmission-form-title-icon"></i>
            {editMode ? "Modifier la transmission" : "Nouvelle transmission"}
          </h3>
          <button onClick={handleClose} className="transmission-form-close-btn" type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transmission-form-content">
          <div className="transmission-form-grid">
            {/* Type */}
            <div className="transmission-form-field">
              <label htmlFor="type" className="transmission-form-label">
                Type <span className="transmission-form-required">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`transmission-form-select ${errors.type ? "transmission-form-error" : ""}`}
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="hdsl">HDSL</option>
                <option value="fibre">Fibre</option>
                <option value="faisceau">Faisceau</option>
                <option value="autres">Autres</option>
              </select>
              {errors.type && <span className="transmission-form-error-text">{errors.type}</span>}
            </div>

            {/* Configuration */}
            <div className="transmission-form-field">
              <label htmlFor="configuration" className="transmission-form-label">
                Configuration
              </label>
              <select
                id="configuration"
                name="configuration"
                value={formData.configuration}
                onChange={handleInputChange}
                className="transmission-form-select"
              >
                <option value="">Sélectionner une configuration</option>
                <option value="1+1">1+1</option>
                <option value="1+0">1+0</option>
              </select>
            </div>

            {/* Débit */}
            <div className="transmission-form-field">
              <label htmlFor="debit" className="transmission-form-label">
                Débit (Mbps)
              </label>
              <input
                type="number"
                id="debit"
                name="debit"
                value={formData.debit}
                onChange={handleInputChange}
                className={`transmission-form-input ${errors.debit ? "transmission-form-error" : ""}`}
                placeholder="Ex: 100"
                min="0"
                step="0.1"
              />
              {errors.debit && <span className="transmission-form-error-text">{errors.debit}</span>}
            </div>

            {/* Fournisseur */}
            <div className="transmission-form-field">
              <label htmlFor="fournisseur" className="transmission-form-label">
                Fournisseur
              </label>
              <input
                type="text"
                id="fournisseur"
                name="fournisseur"
                value={formData.fournisseur}
                onChange={handleInputChange}
                className="transmission-form-input"
                placeholder="Ex: Orange, SFR, Bouygues..."
              />
            </div>

            {/* Date d'installation */}
            <div className="transmission-form-field">
              <label htmlFor="date_installation" className="transmission-form-label">
                Date d'installation
              </label>
              <input
                type="date"
                id="date_installation"
                name="date_installation"
                value={formData.date_installation}
                onChange={handleInputChange}
                className="transmission-form-input"
              />
            </div>

            {/* Date de dernière maintenance */}
            <div className="transmission-form-field">
              <label htmlFor="date_derniere_maintenance" className="transmission-form-label">
                Dernière maintenance
              </label>
              <input
                type="date"
                id="date_derniere_maintenance"
                name="date_derniere_maintenance"
                value={formData.date_derniere_maintenance}
                onChange={handleInputChange}
                className={`transmission-form-input ${errors.date_derniere_maintenance ? "transmission-form-error" : ""}`}
              />
              {errors.date_derniere_maintenance && (
                <span className="transmission-form-error-text">{errors.date_derniere_maintenance}</span>
              )}
            </div>
          </div>

          {/* Observations */}
          <div className="transmission-form-field transmission-form-full-width">
            <label htmlFor="observation" className="transmission-form-label">
              <i className="fas fa-sticky-note"></i>
              Observations
            </label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleInputChange}
              className="transmission-form-textarea"
              placeholder="Notes, remarques, informations complémentaires..."
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="transmission-form-buttons">
            <button type="button" onClick={handleClose} className="transmission-form-btn-cancel">
              <i className="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" disabled={loading} className="transmission-form-btn-submit">
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

export default AddTransmission
