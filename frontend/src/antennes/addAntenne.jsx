"use client"

import { useState, useEffect } from "react"
import "./antenne-crud.css"

const AddAntenne = ({ showModal, setShowModal, onAntenneAdded, onSuccess, onError, editingAntenne, editMode }) => {
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
  const [isLoading, setIsLoading] = useState(false)

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

  useEffect(() => {
    if (editMode && editingAntenne) {
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
  }, [editingAntenne, editMode])

  if (!showModal) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!formData.type || !formData.station) {
        throw new Error("Le type d'antenne et la station sont obligatoires")
      }

      const url = editMode
        ? `http://localhost:3000/antennes/update-antenne/${editingAntenne._id}`
        : "http://localhost:3000/antennes/create-antenne"

      const method = editMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'opération")
      }

      const result = await response.json()

      // Réinitialiser le formulaire
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

      // Fermer le modal et notifier le succès
      setShowModal(false)
      onSuccess(editMode ? "Antenne mise à jour avec succès !" : "Antenne créée avec succès !")
      onAntenneAdded(result.data)
    } catch (err) {
      onError(err.message)
      console.error("Erreur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed1" onClick={() => setShowModal(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{editMode ? "Modifier l'Antenne" : "Nouvelle Antenne"}</h3>
          <button onClick={() => setShowModal(false)} className="modal-close-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="modal-body">
        <form onSubmit={handleSubmit} className="antenne-form-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'Antenne <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner...</option>
                <option value="2G">2G</option>
                <option value="3G">3G</option>
                <option value="4G">4G</option>
                <option value="5G">5G</option>
                <option value="autres">Autres</option>
              </select>
            </div>

            {/* Station */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station <span className="text-red-500">*</span>
              </label>
              <select
                name="station"
                value={formData.station}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner une station...</option>
                {stations.map((station) => (
                  <option key={station._id} value={station._id}>
                    {station.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre d'antennes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'Antennes</label>
              <input
                type="number"
                name="nombre_antennes"
                value={formData.nombre_antennes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="3"
              />
            </div>

            {/* Fréquence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence (MHz)</label>
              <input
                type="number"
                step="0.1"
                name="frequence"
                value={formData.frequence}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2100"
              />
            </div>

            {/* HBA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HBA (m)</label>
              <input
                type="number"
                step="0.1"
                name="HBA"
                value={formData.HBA}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="30"
              />
            </div>

            {/* Type Feeder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type Feeder</label>
              <input
                type="text"
                name="type_feeder"
                value={formData.type_feeder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="7/8"
              />
            </div>

            {/* Longueur Feeder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longueur Feeder (m)</label>
              <input
                type="number"
                step="0.1"
                name="longueur_feeder"
                value={formData.longueur_feeder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="50"
              />
            </div>

            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <select
                name="fournisseur"
                value={formData.fournisseur}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner...</option>
                <option value="Kathrein">Kathrein</option>
                <option value="Jaybeam">Jaybeam</option>
                <option value="Huawei">Huawei</option>
                <option value="autres">Autres</option>
              </select>
            </div>

            {/* Tilt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tilt (°)</label>
              <input
                type="number"
                step="0.1"
                name="tilt"
                value={formData.tilt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2"
              />
            </div>

            {/* Azimut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Azimut (°)</label>
              <input
                type="number"
                step="0.1"
                name="azimut"
                value={formData.azimut}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="120"
              />
            </div>

            {/* Dernier contrôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dernier Contrôle</label>
              <input
                type="date"
                name="dernier_controle"
                value={formData.dernier_controle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* État */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
              <select
                name="etat"
                value={formData.etat}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="actif">Actif</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          {/* État de serrage */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="etat_serrage"
                checked={formData.etat_serrage}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">État de Serrage OK</span>
            </label>
          </div>

          {/* Observations */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
            <textarea
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Observations sur l'antenne..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "En cours..." : editMode ? "Mettre à jour" : "Enregister"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default AddAntenne
