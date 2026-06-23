import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePedagogicalReport = (reportData: any) => {
  const doc = new jsPDF();
  const { student, summary, details } = reportData;

  // Title & Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(86, 180, 233); // Primary Color (Sky Blue)
  doc.text('Reporte Pedagógico', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Estudiante: ${student.first_name} ${student.last_name}`, 14, 30);
  doc.text(`Tutor: ${student.tutor_name}`, 14, 36);

  // Summary Metrics
  doc.setFont('helvetica', 'bold');
  doc.text(`Resumen de Rendimiento:`, 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Actividades: ${summary.total_activities}`, 14, 52);
  doc.text(`Completadas: ${summary.completed}`, 14, 58);
  doc.text(`Faltantes: ${summary.not_completed}`, 14, 64);
  
  // Color the percentage
  doc.setFont('helvetica', 'bold');
  if (summary.performance_percentage >= 70) doc.setTextColor(0, 158, 113); // Success Green
  else if (summary.performance_percentage >= 50) doc.setTextColor(230, 159, 0); // Accent Orange
  else doc.setTextColor(213, 94, 0); // Danger Red
  
  doc.text(`Porcentaje de Rendimiento: ${summary.performance_percentage}%`, 14, 72);
  doc.setTextColor(50, 50, 50);

  // Table Data
  const tableColumn = ["Trimestre", "Unidad", "Fecha", "Actividad", "Estado"];
  const tableRows: any[] = [];

  details.forEach((d: any) => {
    const statusData = d.is_completed ? "✅ Completado" : "❌ No Completado";
    tableRows.push([d.term, d.unit, d.session_date, d.activity, statusData]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 80,
    theme: 'grid',
    headStyles: { fillColor: [86, 180, 233] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { font: 'helvetica', fontSize: 10 }
  });

  // Footer & Signature
  const finalY = (doc as any).lastAutoTable.finalY || 80;
  doc.setFontSize(10);
  doc.text('Firma del Profesor:', 14, finalY + 30);
  doc.line(14, finalY + 40, 80, finalY + 40); // Line for Professor

  doc.text('Firma del Tutor:', 110, finalY + 30);
  doc.line(110, finalY + 40, 180, finalY + 40); // Line for Tutor

  // Save PDF
  doc.save(`Reporte_${student.first_name}_${student.last_name}.pdf`);
};

export const generateClassCentralizerReport = (className: string, data: any[]) => {
  const doc = new jsPDF();

  // Title & Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(86, 180, 233); // Primary Color (Sky Blue)
  doc.text('Cuadro Centralizador de Calificaciones', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Clase: ${className}`, 14, 30);
  doc.text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, 14, 36);

  // Table Data
  const tableColumn = ["Estudiante", "Actividades Totales", "Actividades Completadas", "Puntos Comportamiento", "Asistencia (P / A / F)", "Rendimiento"];
  const tableRows: any[] = [];

  data.forEach((row: any) => {
    tableRows.push([
      `${row.first_name} ${row.last_name}`,
      row.total_activities,
      row.completed_activities,
      `${row.behavior_score} pts`,
      `${row.attendance.presents} / ${row.attendance.lates} / ${row.attendance.absents}`,
      `${row.performance_percentage}%`
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [86, 180, 233] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { font: 'helvetica', fontSize: 10 }
  });

  // Footer & Signature
  const finalY = (doc as any).lastAutoTable.finalY || 45;
  doc.setFontSize(10);
  doc.text('Firma del Profesor:', 14, finalY + 30);
  doc.line(14, finalY + 40, 80, finalY + 40); // Line for Professor

  doc.text('Sello de la Institución:', 110, finalY + 30);
  doc.line(110, finalY + 40, 180, finalY + 40); // Line for School

  // Save PDF
  doc.save(`Centralizador_${className.replace(/\s+/g, '_')}.pdf`);
};
