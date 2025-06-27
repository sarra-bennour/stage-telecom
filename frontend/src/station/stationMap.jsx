"use client"

import { useEffect, useRef, useState } from 'react'

const StationMap = ({ stations = [], onStationClick }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

    console.log("Stations reçues dans StationMap:", stations)


  useEffect(() => {
    let mounted = true

    const loadLeaflet = async () => {
      try {
        if (typeof window !== 'undefined' && !window.L) {
          // Vérifier si le CSS est déjà chargé
          if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
            link.crossOrigin = ''
            document.head.appendChild(link)
          }

          // Charger le script seulement s'il n'est pas déjà présent
          if (!document.querySelector('script[src*="leaflet"]')) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
              script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
              script.crossOrigin = ''
              script.onload = () => {
                // Fix for default markers
                delete window.L.Icon.Default.prototype._getIconUrl
                window.L.Icon.Default.mergeOptions({
                  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                })
                resolve()
              }
              script.onerror = () => {
                reject(new Error('Failed to load Leaflet'))
              }
              document.head.appendChild(script)
            })
          }
        }
        
        if (mounted) {
          initializeMap()
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    loadLeaflet()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateMarkers()
    }
  }, [stations])

  const initializeMap = () => {
    if (!mapRef.current || !window.L || mapInstanceRef.current) return

    // Default center (Tunisia coordinates)
    const defaultCenter = [33.8869, 9.5375]
    const defaultZoom = 7

    // Calculate center based on stations if available
    let center = defaultCenter
    let zoom = defaultZoom

    if (stations.length > 0) {
      const validStations = stations.filter(s => s.position_x && s.position_y)
      
      if (validStations.length > 0) {
        const bounds = window.L.latLngBounds()
        validStations.forEach(station => {
          bounds.extend([parseFloat(station.position_y), parseFloat(station.position_x)])
        })
        
        mapInstanceRef.current = window.L.map(mapRef.current).fitBounds(bounds, {
          padding: [20, 20]
        })
      } else {
        mapInstanceRef.current = window.L.map(mapRef.current).setView(center, zoom)
      }
    } else {
      mapInstanceRef.current = window.L.map(mapRef.current).setView(center, zoom)
    }

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)

    updateMarkers()
  }

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    stations.forEach(station => {
      if (station.position_x && station.position_y) {
        const lat = parseFloat(station.position_y)
        const lng = parseFloat(station.position_x)

        if (!isNaN(lat) && !isNaN(lng)) {
          // Create custom icon based on station status and type
          const iconColor = getMarkerColor(station.statut, station.type_technique)
          
          const customIcon = window.L.divIcon({
            html: `
              <div style="
                background-color: ${iconColor.bg};
                border: 2px solid ${iconColor.border};
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ">
                <div style="
                  background-color: ${iconColor.dot};
                  border-radius: 50%;
                  width: 8px;
                  height: 8px;
                "></div>
              </div>
            `,
            className: 'custom-station-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          const marker = window.L.marker([lat, lng], { icon: customIcon })

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                  ${station.nom || 'Station sans nom'}
                </h3>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Type:</span>
                  <span style="
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 12px;
                    background-color: ${getTypeColor(station.type_technique).bg};
                    color: ${getTypeColor(station.type_technique).text};
                    border: 1px solid ${getTypeColor(station.type_technique).border};
                  ">
                    ${station.type_technique || 'N/A'}
                  </span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Statut:</span>
                  <span style="
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 12px;
                    background-color: ${getStatusColor(station.statut).bg};
                    color: ${getStatusColor(station.statut).text};
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  ">
                    <div style="
                      width: 6px;
                      height: 6px;
                      border-radius: 50%;
                      background-color: ${getStatusColor(station.statut).text};
                    "></div>
                    ${station.statut === 'actif' ? 'Active' : station.statut === 'maintenance' ? 'Maintenance' : 'Inactive'}
                  </span>
                </div>
                
                ${station.puissance ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Puissance:</span>
                    <span style="font-size: 12px; color: #1f2937; font-weight: 500;">${station.puissance}W</span>
                  </div>
                ` : ''}
                
                ${station.fournisseur ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Fournisseur:</span>
                    <span style="font-size: 12px; color: #1f2937;">${station.fournisseur}</span>
                  </div>
                ` : ''}
                
                ${station.generation ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Génération:</span>
                    <span style="font-size: 12px; color: #1f2937; font-weight: 500;">${station.generation}</span>
                  </div>
                ` : ''}
              </div>
              
              <div style="
                padding: 8px;
                background-color: #f9fafb;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
                text-align: center;
              ">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Coordonnées</div>
                <div style="font-size: 12px; color: #1f2937; font-family: monospace;">
                  ${lat.toFixed(4)}, ${lng.toFixed(4)}
                </div>
              </div>
              
              ${station.date_installation ? `
                <div style="
                  text-align: center;
                  margin-top: 8px;
                  font-size: 11px;
                  color: #6b7280;
                ">
                  Installée le ${new Date(station.date_installation).toLocaleDateString('fr-FR')}
                </div>
              ` : ''}
            </div>
          `

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
          })

          // Add click event
          marker.on('click', () => {
            if (onStationClick) {
              onStationClick(station)
            }
          })

          marker.addTo(mapInstanceRef.current)
          markersRef.current.push(marker)
        }
      }
    })
  }

  const getMarkerColor = (status, type) => {
    const statusColors = {
      actif: { bg: '#10b981', border: '#065f46', dot: '#ffffff' },
      maintenance: { bg: '#f59e0b', border: '#92400e', dot: '#ffffff' },
      inactif: { bg: '#ef4444', border: '#991b1b', dot: '#ffffff' }
    }

    return statusColors[status] || statusColors.inactif
  }

  const getTypeColor = (type) => {
    const colors = {
      macro: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
      micro: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
      indoor: { bg: '#f3e8ff', text: '#7c3aed', border: '#e9d5ff' },
      outdoor: { bg: '#fed7aa', text: '#ea580c', border: '#fed7aa' }
    }
    return colors[type] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' }
  }

  const getStatusColor = (status) => {
    const colors = {
      actif: { bg: '#dcfce7', text: '#16a34a' },
      maintenance: { bg: '#fef3c7', text: '#d97706' },
      inactif: { bg: '#fee2e2', text: '#dc2626' }
    }
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280' }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)',
          zIndex: 1000
        }}>
          <div>Chargement de la carte...</div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)',
          zIndex: 1000,
          color: 'red'
        }}>
          <div>Erreur: {error}</div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: '300px' // Ajout d'une hauteur minimale
        }} 
      />
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
          Légende
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '1px solid #065f46'
            }}></div>
            <span style={{ color: '#6b7280' }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              border: '1px solid #92400e'
            }}></div>
            <span style={{ color: '#6b7280' }}>Maintenance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '1px solid #991b1b'
            }}></div>
            <span style={{ color: '#6b7280' }}>Inactive</span>
          </div>
        </div>
      </div>

      {/* Station count */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280',
        zIndex: 1000
      }}>
        {stations.filter(s => s.position_x && s.position_y).length} station(s) affichée(s)
      </div>
    </div>
  )
}

export default StationMap