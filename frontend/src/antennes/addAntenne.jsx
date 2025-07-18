"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AddAntenne = ({ showModal, setShowModal, onAntenneAdded, onSuccess, onError, editingAntenne, editMode, currentUserId }) => {
  const [formData, setFormData] = useState({
    type: "",
    nombre_antennes: "",
    frequence: "",
    HBA: "",
    type_feeder: "",
    longueur_feeder: "",
    observation: "",
    etat: "actif",
    etat_serrage: false,
    dernier_controle: "",
    fournisseur: "",
    tilt: "",
    azimut: "",
    station: "",
  })

  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch stations for dropdown
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("http://localhost:3000/stations/station-list")
        if (response.ok) {
          const data = await response.json()
          setStations(data.data || [])
        }
      } catch (err) {
        console.error("Erreur lors du chargement des stations:", err)
      }
    }
    fetchStations()
  }, [])

  // Reset form when modal opens/closes or when switching between add/edit modes
  useEffect(() => {
    if (showModal) {
      if (editMode && editingAntenne) {
        // Populate form with existing antenne data
        setFormData({
          type: editingAntenne.type || "",
          nombre_antennes: editingAntenne.nombre_antennes || "",
          frequence: editingAntenne.frequence || "",
          HBA: editingAntenne.HBA || "",
          type_feeder: editingAntenne.type_feeder || "",
          longueur_feeder: editingAntenne.longueur_feeder || "",
          observation: editingAntenne.observation || "",
          etat: editingAntenne.etat || "actif",
          etat_serrage: editingAntenne.etat_serrage || false,
          dernier_controle: editingAntenne.dernier_controle
            ? new Date(editingAntenne.dernier_controle).toISOString().split("T")[0]
            : "",
          fournisseur: editingAntenne.fournisseur || "",
          tilt: editingAntenne.tilt || "",
          azimut: editingAntenne.azimut || "",
          station: editingAntenne.station?._id || editingAntenne.station || "",
        })
      } else {
        // Reset form for new antenne
        setFormData({
          type: "",
          nombre_antennes: "",
          frequence: "",
          HBA: "",
          type_feeder: "",
          longueur_feeder: "",
          observation: "",
          etat: "actif",
          etat_serrage: false,
          dernier_controle: "",
          fournisseur: "",
          tilt: "",
          azimut: "",
          station: "",
        })
      }
      setErrors({})
    }
  }, [showModal, editMode, editingAntenne])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      newErrors.type = "Le type d'antenne est requis"
    }

    if (!formData.station) {
      newErrors.station = "La station est requise"
    }

    if (formData.frequence && (isNaN(formData.frequence) || Number(formData.frequence) <= 0)) {
      newErrors.frequence = "La fréquence doit être un nombre positif"
    }

    if (formData.HBA && (isNaN(formData.HBA) || Number(formData.HBA) <= 0)) {
      newErrors.HBA = "La HBA doit être un nombre positif"
    }

    if (formData.tilt && (isNaN(formData.tilt) || Number(formData.tilt) < -90 || Number(formData.tilt) > 90)) {
      newErrors.tilt = "Le tilt doit être entre -90° et 90°"
    }

    if (formData.azimut && (isNaN(formData.azimut) || Number(formData.azimut) < 0 || Number(formData.azimut) >= 360)) {
      newErrors.azimut = "L'azimut doit être entre 0° et 359°"
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
        nombre_antennes: formData.nombre_antennes ? Number(formData.nombre_antennes) : undefined,
        frequence: formData.frequence ? Number(formData.frequence) : undefined,
        HBA: formData.HBA ? Number(formData.HBA) : undefined,
        longueur_feeder: formData.longueur_feeder ? Number(formData.longueur_feeder) : undefined,
        tilt: formData.tilt ? Number(formData.tilt) : undefined,
        azimut: formData.azimut ? Number(formData.azimut) : undefined,
        dernier_controle: formData.dernier_controle || undefined,
        createdBy: currentUserId
      }

      // Ajouter l'ID utilisateur si disponible
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
      if (editMode && editingAntenne) {
        // Update existing antenne
        response = await axios.put(`http://localhost:3000/antennes/update-antenne/${editingAntenne._id}`, submitData, {
          withCredentials: true,
        })
        onSuccess("Antenne modifiée avec succès !")
      } else {
        // Create new antenne
        response = await axios.post("http://localhost:3000/antennes/create-antenne", submitData, {
          withCredentials: true,
        })
        onSuccess("Antenne créée avec succès !")
      }

      if (response.data && response.data.data) {
        onAntenneAdded(response.data.data)
      }

      setShowModal(false)
      setFormData({
        type: "",
        nombre_antennes: "",
        frequence: "",
        HBA: "",
        type_feeder: "",
        longueur_feeder: "",
        observation: "",
        etat: "actif",
        etat_serrage: false,
        dernier_controle: "",
        fournisseur: "",
        tilt: "",
        azimut: "",
        station: "",
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
      nombre_antennes: "",
      frequence: "",
      HBA: "",
      type_feeder: "",
      longueur_feeder: "",
      observation: "",
      etat: "actif",
      etat_serrage: false,
      dernier_controle: "",
      fournisseur: "",
      tilt: "",
      azimut: "",
      station: "",
    })
    setErrors({})
  }

  if (!showModal) return null

  return (
    <div className="antenne-form-overlay">
      <div className="antenne-form-modal">
        <div className="antenne-form-header">
          <h3 className="antenne-form-title">
            <i className="fas fa-tower-cell antenne-form-title-icon"></i>
            {editMode ? "Modifier l'antenne" : "Nouvelle antenne"}
          </h3>
          <button onClick={handleClose} className="antenne-form-close-btn" type="button">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="antenne-form-content">
          <div className="antenne-form-grid">
            {/* Type */}
            <div className="antenne-form-field">
              <label htmlFor="type" className="antenne-form-label">
                <i className="fas fa-signal"></i>
                Type d'antenne <span className="antenne-form-required">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`antenne-form-select ${errors.type ? "antenne-form-error" : ""}`}
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="2G">2G</option>
                <option value="3G">3G</option>
                <option value="4G">4G</option>
                <option value="5G">5G</option>
                <option value="autres">Autres</option>
              </select>
              {errors.type && <span className="antenne-form-error-text">{errors.type}</span>}
            </div>

            {/* Station */}
            <div className="antenne-form-field">
              <label htmlFor="station" className="antenne-form-label">
                <i className="fas fa-building"></i>
                Station <span className="antenne-form-required">*</span>
              </label>
              <select
                id="station"
                name="station"
                value={formData.station}
                onChange={handleInputChange}
                className={`antenne-form-select ${errors.station ? "antenne-form-error" : ""}`}
                required
              >
                <option value="">Sélectionner une station</option>
                {stations.map((station) => (
                  <option key={station._id} value={station._id}>
                    {station.nom}
                  </option>
                ))}
              </select>
              {errors.station && <span className="antenne-form-error-text">{errors.station}</span>}
            </div>

            {/* Nombre d'antennes */}
            <div className="antenne-form-field">
              <label htmlFor="nombre_antennes" className="antenne-form-label">
                <i className="fas fa-hashtag"></i>
                Nombre d'antennes
              </label>
              <input
                type="number"
                id="nombre_antennes"
                name="nombre_antennes"
                value={formData.nombre_antennes}
                onChange={handleInputChange}
                className="antenne-form-input"
                placeholder="Ex: 3"
                min="1"
              />
            </div>

            {/* Fréquence */}
            <div className="antenne-form-field">
              <label htmlFor="frequence" className="antenne-form-label">
                <i className="fas fa-wave-square"></i>
                Fréquence (MHz)
              </label>
              <input
                type="number"
                id="frequence"
                name="frequence"
                value={formData.frequence}
                onChange={handleInputChange}
                className={`antenne-form-input ${errors.frequence ? "antenne-form-error" : ""}`}
                placeholder="Ex: 2100"
                min="0"
                step="0.1"
              />
              {errors.frequence && <span className="antenne-form-error-text">{errors.frequence}</span>}
            </div>

            {/* HBA */}
            <div className="antenne-form-field">
              <label htmlFor="HBA" className="antenne-form-label">
                <i className="fas fa-ruler-vertical"></i>
                HBA (m)
              </label>
              <input
                type="number"
                id="HBA"
                name="HBA"
                value={formData.HBA}
                onChange={handleInputChange}
                className={`antenne-form-input ${errors.HBA ? "antenne-form-error" : ""}`}
                placeholder="Ex: 30"
                min="0"
                step="0.1"
              />
              {errors.HBA && <span className="antenne-form-error-text">{errors.HBA}</span>}
            </div>

            {/* Type Feeder */}
            <div className="antenne-form-field">
              <label htmlFor="type_feeder" className="antenne-form-label">
                <i className="fas fa-cable-car"></i>
                Type Feeder
              </label>
              <input
                type="text"
                id="type_feeder"
                name="type_feeder"
                value={formData.type_feeder}
                onChange={handleInputChange}
                className="antenne-form-input"
                placeholder="Ex: 7/8"
              />
            </div>

            {/* Longueur Feeder */}
            <div className="antenne-form-field">
              <label htmlFor="longueur_feeder" className="antenne-form-label">
                <i className="fas fa-ruler-horizontal"></i>
                Longueur Feeder (m)
              </label>
              <input
                type="number"
                id="longueur_feeder"
                name="longueur_feeder"
                value={formData.longueur_feeder}
                onChange={handleInputChange}
                className="antenne-form-input"
                placeholder="Ex: 50"
                min="0"
                step="0.1"
              />
            </div>

            {/* Fournisseur */}
            <div className="antenne-form-field">
              <label htmlFor="fournisseur" className="antenne-form-label">
                <i className="fas fa-industry"></i>
                Fournisseur
              </label>
              <select
                id="fournisseur"
                name="fournisseur"
                value={formData.fournisseur}
                onChange={handleInputChange}
                className="antenne-form-select"
              >
                <option value="">Sélectionner un fournisseur</option>
                <option value="Kathrein">Kathrein</option>
                <option value="Jaybeam">Jaybeam</option>
                <option value="Huawei">Huawei</option>
                <option value="Nokia">Nokia</option>
                <option value="Ericsson">Ericsson</option>
                <option value="autres">Autres</option>
              </select>
            </div>

            {/* Tilt */}
            <div className="antenne-form-field">
              <label htmlFor="tilt" className="antenne-form-label">
                <i className="fas fa-angle-down"></i>
                Tilt (°)
              </label>
              <input
                type="number"
                id="tilt"
                name="tilt"
                value={formData.tilt}
                onChange={handleInputChange}
                className={`antenne-form-input ${errors.tilt ? "antenne-form-error" : ""}`}
                placeholder="Ex: 2"
                min="-90"
                max="90"
                step="0.1"
              />
              {errors.tilt && <span className="antenne-form-error-text">{errors.tilt}</span>}
            </div>

            {/* Azimut */}
            <div className="antenne-form-field">
              <label htmlFor="azimut" className="antenne-form-label">
                <i className="fas fa-compass"></i>
                Azimut (°)
              </label>
              <input
                type="number"
                id="azimut"
                name="azimut"
                value={formData.azimut}
                onChange={handleInputChange}
                className={`antenne-form-input ${errors.azimut ? "antenne-form-error" : ""}`}
                placeholder="Ex: 120"
                min="0"
                max="359"
                step="0.1"
              />
              {errors.azimut && <span className="antenne-form-error-text">{errors.azimut}</span>}
            </div>

            {/* Dernier contrôle */}
            <div className="antenne-form-field">
              <label htmlFor="dernier_controle" className="antenne-form-label">
                <i className="fas fa-calendar-check"></i>
                Dernier contrôle
              </label>
              <input
                type="date"
                id="dernier_controle"
                name="dernier_controle"
                value={formData.dernier_controle}
                onChange={handleInputChange}
                className="antenne-form-input"
              />
            </div>

            {/* État */}
            <div className="antenne-form-field">
              <label htmlFor="etat" className="antenne-form-label">
                <i className="fas fa-info-circle"></i>
                État
              </label>
              <select
                id="etat"
                name="etat"
                value={formData.etat}
                onChange={handleInputChange}
                className="antenne-form-select"
              >
                <option value="actif">Actif</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          {/* État de serrage */}
          <div className="antenne-form-field antenne-form-checkbox-field">
            <label className="antenne-form-checkbox-label">
              <input
                type="checkbox"
                name="etat_serrage"
                checked={formData.etat_serrage}
                onChange={handleInputChange}
                className="antenne-form-checkbox"
              />
              <span className="antenne-form-checkbox-text">
                <i className="fas fa-wrench"></i>
                État de serrage OK
              </span>
            </label>
          </div>

          {/* Observations */}
          <div className="antenne-form-field antenne-form-full-width">
            <label htmlFor="observation" className="antenne-form-label">
              <i className="fas fa-sticky-note"></i>
              Observations
            </label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleInputChange}
              className="antenne-form-textarea"
              placeholder="Notes, remarques, informations complémentaires sur l'antenne..."
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="antenne-form-buttons">
            <button type="button" onClick={handleClose} className="antenne-form-btn-cancel">
              <i className="fas fa-times"></i>
              Annuler
            </button>
            <button type="submit" disabled={loading} className="antenne-form-btn-submit">
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

export default AddAntenne
