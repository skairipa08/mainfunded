import jsPDF from 'jspdf';

interface CertificatePayload {
  mentorName: string;
  year: number;
  totalHours: number;
  issueDate: Date;
}

export function generateMentorCertificatePdf(payload: CertificatePayload): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const issueDate = payload.issueDate.toLocaleDateString('tr-TR');

  doc.setFillColor(245, 248, 255);
  doc.rect(0, 0, 842, 595, 'F');

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(3);
  doc.rect(24, 24, 794, 547, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(34);
  doc.text('FundEd Gönüllülük Sertifikası', 421, 150, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(20);
  doc.text('Bu sertifika', 421, 210, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(30, 64, 175);
  doc.text(payload.mentorName, 421, 260, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text(
    `${payload.year} yılı boyunca toplam ${payload.totalHours.toFixed(1)} saat mentorluk desteği verdiği için verilmiştir.`,
    421,
    315,
    { align: 'center' },
  );

  doc.setFontSize(14);
  doc.text(`Düzenlenme Tarihi: ${issueDate}`, 421, 380, { align: 'center' });
  doc.text('FundEd Platformu', 421, 430, { align: 'center' });

  return doc.output('arraybuffer');
}
