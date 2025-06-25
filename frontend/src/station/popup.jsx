"use client"

import { useEffect } from "react"

const PopUp = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const isSuccess = type === "success"
  const isError = type === "error"

  return (
    <div
      style={{
        position: "fixed",
        top: "2rem",
        right: "2rem",
        zIndex: 10000,
        maxWidth: "400px",
        width: "100%",
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: "0.75rem",
          padding: "1rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        {/* Icône */}
        <div
          style={{
            flexShrink: 0,
            width: "1.5rem",
            height: "1.5rem",
            borderRadius: "50%",
            backgroundColor: isSuccess ? "#16a34a" : "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSuccess ? (
            <svg
              style={{ width: "1rem", height: "1rem", color: "white" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              style={{ width: "1rem", height: "1rem", color: "white" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Contenu */}
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: isSuccess ? "#166534" : "#991b1b",
              margin: 0,
              marginBottom: "0.25rem",
            }}
          >
            {isSuccess ? "Succès" : "Erreur"}
          </h4>
          <p
            style={{
              fontSize: "0.875rem",
              color: isSuccess ? "#15803d" : "#b91c1c",
              margin: 0,
              lineHeight: "1.4",
            }}
          >
            {message}
          </p>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            backgroundColor: "transparent",
            border: "none",
            color: isSuccess ? "#16a34a" : "#dc2626",
            cursor: "pointer",
            padding: "0.25rem",
            borderRadius: "0.25rem",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isSuccess ? "#dcfce7" : "#fee2e2"
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent"
          }}
        >
          <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PopUp
