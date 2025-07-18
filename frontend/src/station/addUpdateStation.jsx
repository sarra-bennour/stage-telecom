"use client"

import { useState, useRef, useEffect } from "react"

const AddUpdateStation = ({ showModal, setShowModal, onStationAdded, onSuccess, onError, editingStation, editMode,currentUserId }) => {
  const [formData, setFormData] = useState({
    nom: "",
    position_x: "",
    position_y: "",
    statut: "actif",
    type_technique: "",
    accessibilite: false,
    generation: "",
    fournisseur: "",
    montant_location: "",
    type_support: "",
    hauteur_support: "",
    configuration: "",
    puissance: "",
    date_installation: "",
    derniere_maintenance: ""
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      if (editMode && editingStation) {
        setFormData({
          nom: editingStation.nom || "",
          position_x: editingStation.position_x || "",
          position_y: editingStation.position_y || "",
          statut: editingStation.statut || "actif",
          type_technique: editingStation.type_technique || "",
          accessibilite: editingStation.accessibilite || false,
          generation: editingStation.generation || "",
          fournisseur: editingStation.fournisseur || "",
          montant_location: editingStation.montant_location || "",
          type_support: editingStation.type_support || "",
          hauteur_support: editingStation.hauteur_support || "",
          configuration: editingStation.configuration || "",
          puissance: editingStation.puissance || "",
          date_installation: editingStation.date_installation || "",
          derniere_maintenance: editingStation.derniere_maintenance || ""
        });
        // Ajoutez ceci pour charger les images existantes
        if (editingStation.images_secteurs && editingStation.images_secteurs.length > 0) {
          const existingImages = editingStation.images_secteurs.map(img => ({
            url: img.startsWith('http') ? img : `http://localhost:3000${img.startsWith('/') ? img : `/${img}`}`,
            name: img.split('/').pop(),
            size: 0, // Taille inconnue pour les images existantes
            isExisting: true // Marquer comme image existante
          }));
          setSelectedImages(existingImages);
        }
      }
    }, [editingStation, editMode]);


    useEffect(() => {
  return () => {
    // Nettoyer seulement les URLs créées pour la prévisualisation
    selectedImages.forEach(img => {
      if (img.url && img.file) { // Seulement les nouvelles images
        URL.revokeObjectURL(img.url);
      }
    });
  };
}, [selectedImages]);

  if (!showModal) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Vérifier le nombre d'images
    if (files.length + selectedImages.length > 5) {
      onError("Vous ne pouvez pas uploader plus de 5 images");
      return;
    }

    // Vérifier le type et la taille des fichiers
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        onError("Seuls les fichiers JPEG, JPG, PNG et GIF sont autorisés");
        return false;
      }
      if (!isValidSize) {
        onError("La taille maximale d'une image est de 5MB");
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Créer des URLs pour la prévisualisation
    const imagePreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setSelectedImages(prev => [...prev, ...imagePreviews]);
  };

  const removeImage = (index) => {
    // Libérer l'URL de l'objet
    URL.revokeObjectURL(selectedImages[index].url);
    
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.nom || !formData.position_x || !formData.position_y || !formData.type_technique) {
        throw new Error("Les champs nom, position et type technique sont obligatoires");
      }

      const formDataToSend = new FormData();

      if (currentUserId) {
      formDataToSend.append('createdBy', currentUserId);
    }
      
      // Ajouter les données du formulaire
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Ajouter les images
      selectedImages.forEach((image) => {
      if (image.file) { 
        formDataToSend.append('images', image.file);
      } else if (image.isExisting) {
        // Pour les images existantes, ajoutez l'URL
        formDataToSend.append('existingImages', image.url);
      }
    });

      const url = editMode 
        ? `http://localhost:3000/stations/update-station/${editingStation._id}`
        : "http://localhost:3000/stations/create-station";

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'opération");
      }

      const result = await response.json();

      // Nettoyer les URLs des images
      selectedImages.forEach(img => URL.revokeObjectURL(img.url));

      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        position_x: "",
        position_y: "",
        statut: "actif",
        type_technique: "",
        accessibilite: false,
        generation: "",
        fournisseur: "",
        montant_location: "",
        type_support: "",
        hauteur_support: "",
        configuration: "",
        puissance: "",
        date_installation: "",
        derniere_maintenance: ""
      });
      setSelectedImages([]);

      // Fermer le modal et notifier le succès
      setShowModal(false);
      onSuccess(editMode ? "Station mise à jour avec succès !" : "Station créée avec succès !");
      onStationAdded(result.data);
    } catch (err) {
      onError(err.message);
      console.error("Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      style={{
        position: "fixed",
        inset: "0",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 9999,
      }}
      onClick={() => setShowModal(false)}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "1rem",
          maxWidth: "56rem",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header du modal */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            background: "linear-gradient(to right, #eff6ff, #eef2ff)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  color: "#4f46e5",
                  marginRight: "0.5rem",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
              {editMode ? "Modifier la Station" : "Nouvelle Station"}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              style={{
                color: "#9ca3af",
                padding: "0.5rem",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#6b7280"
                e.target.style.backgroundColor = "#f3f4f6"
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#9ca3af"
                e.target.style.backgroundColor = "transparent"
              }}
            >
              <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div style={{ padding: "1.5rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Informations de base */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#1f2937",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#2563eb",
                    marginRight: "0.5rem",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Informations de base
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Nom Station <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    placeholder="Nom de la station"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="accessibilite"
                      checked={formData.accessibilite}
                      onChange={handleChange}
                      style={{
                        width: "1rem",
                        height: "1rem",
                        accentColor: "#6366f1",
                      }}
                    />
                    Accessibilité
                  </label>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div
              style={{
                backgroundColor: "#f0fdf4",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#1f2937",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#16a34a",
                    marginRight: "0.5rem",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Localisation
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Position X (Longitude) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="position_x"
                    value={formData.position_x}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    placeholder="10.1815"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Position Y (Latitude) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="position_y"
                    value={formData.position_y}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    placeholder="36.8065"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Spécifications techniques */}
            <div
              style={{
                backgroundColor: "#fff7ed",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#1f2937",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#ea580c",
                    marginRight: "0.5rem",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Spécifications techniques
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Type Technique <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    name="type_technique"
                    value={formData.type_technique}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="micro">Micro</option>
                    <option value="macro">Macro</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Génération
                  </label>
                  <select
                    name="generation"
                    value={formData.generation}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="2G">2G</option>
                    <option value="3G">3G</option>
                    <option value="4G">4G</option>
                    <option value="5G">5G</option>
                    <option value="autres">Autres</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Fournisseur
                  </label>
                  <select
                    name="fournisseur"
                    value={formData.fournisseur}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Huawei">Huawei</option>
                    <option value="Alcatel">Alcatel</option>
                    <option value="NokiaSiemens">Nokia Siemens</option>
                    <option value="autres">Autres</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Puissance (W)
                  </label>
                  <input
                    type="number"
                    name="puissance"
                    value={formData.puissance}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    placeholder="20"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Support et Infrastructure */}
            <div
              style={{
                backgroundColor: "#fef3c7",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#1f2937",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#d97706",
                    marginRight: "0.5rem",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Support et Infrastructure
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Type de Support
                  </label>
                  <select
                    name="type_support"
                    value={formData.type_support}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="mat">Mât</option>
                    <option value="monopole">Monopole</option>
                    <option value="pilone">Pylône</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Hauteur Support (m)
                  </label>
                  <input
                    type="number"
                    name="hauteur_support"
                    value={formData.hauteur_support}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    placeholder="30"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Montant Location (DT)
                  </label>
                  <input
                    type="number"
                    name="montant_location"
                    value={formData.montant_location}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    placeholder="1500"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Informations complémentaires */}
            <div
              style={{
                backgroundColor: "#faf5ff",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#1f2937",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#9333ea",
                    marginRight: "0.5rem",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Informations complémentaires
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Date Installation
                  </label>
                  <input
                    type="date"
                    name="date_installation"
                    value={formData.date_installation}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Dernière Maintenance
                  </label>
                  <input
                    type="date"
                    name="derniere_maintenance"
                    value={formData.derniere_maintenance}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1"
                      e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="actif">Actif</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Configuration
                </label>
                <textarea
                  name="configuration"
                  value={formData.configuration}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    transition: "all 0.2s",
                    outline: "none",
                    resize: "none",
                    minHeight: "100px",
                  }}
                  rows="4"
                  placeholder="Détails de configuration..."
                  onFocus={(e) => {
                    e.target.style.borderColor = "#6366f1"
                    e.target.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.2)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db"
                    e.target.style.boxShadow = "none"
                  }}
                ></textarea>
              </div>
            </div>

            {/* Section Images */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            padding: "1rem",
            borderRadius: "0.5rem",
          }}
        >
          <h4
            style={{
              fontSize: "1.125rem",
              fontWeight: "500",
              color: "#1f2937",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "#0ea5e9",
                marginRight: "0.5rem",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Images de la station
          </h4>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Ajouter des images (max 5)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg, image/jpg, image/png, image/gif"
              onChange={handleImageChange}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "2px dashed #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                transition: "all 0.2s",
                outline: "none",
                backgroundColor: "#f9fafb",
                cursor: "pointer",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "0.5rem",
              }}
            >
              Formats acceptés : JPG, PNG, GIF. Taille max : 5MB par image.
            </p>
          </div>

          {/* Prévisualisation des images */}
          {selectedImages.length > 0 && (
            <div>
              <h5
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "0.75rem",
                }}
              >
                Images sélectionnées ({selectedImages.length}/5)
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "1rem",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {selectedImages.map((image, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "white",
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: "0.25rem",
                        right: "0.25rem",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "1.5rem",
                        height: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      ×
                    </button>
                    <div
                      style={{
                        padding: "0.5rem",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        textAlign: "center",
                        wordBreak: "break-all",
                      }}
                    >
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

            {/* Footer du modal */}
            <div
              style={{
                padding: "1.5rem",
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  color: "#374151",
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f9fafb"
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white"
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  opacity: isLoading ? 0.7 : 1,
                }}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = "#1d4ed8"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = "#2563eb"
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        marginRight: "0.5rem",
                        animation: "spin 1s linear infinite",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    En cours...
                  </>
                ) : (
                  <>
                    <svg
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        marginRight: "0.5rem",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddUpdateStation
