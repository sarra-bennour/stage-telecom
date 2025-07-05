import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Fonction pour exporter en Excel
export const exportToExcel = (data, columns, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Fonction pour exporter en PDF
export const exportToPDF = (data, columns, filename, title) => {
  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(18);
  doc.text(title, 14, 15);
  
  // Préparer les données pour le tableau
  const tableData = data.map(item => {
    return columns.map(col => {
      // Gérer les propriétés imbriquées comme 'station.nom'
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        return keys.reduce((obj, key) => (obj && obj[key]) ? obj[key] : 'N/A', item);
      }
      return item[col.key] || 'N/A';
    });
  });

  const headers = columns.map(col => col.header);

  // Tableau
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 25,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      // Ajouter plus de styles de colonne si nécessaire
    }
  });
  
  doc.save(`${filename}.pdf`);
};