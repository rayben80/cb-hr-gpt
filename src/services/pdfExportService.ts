/**
 * PDF Export Service
 * Uses html2canvas and jsPDF to export reports as PDF
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFExportOptions {
    filename?: string;
    title?: string;
    subtitle?: string;
    orientation?: 'portrait' | 'landscape';
    format?: 'a4' | 'letter';
    scale?: number;
    imageType?: 'png' | 'jpeg';
    imageQuality?: number;
}

const getRecommendedScale = (element: HTMLElement, fallback: number): number => {
    const area = element.scrollWidth * element.scrollHeight;
    if (!Number.isFinite(area) || area <= 0) return fallback;
    if (area > 3_000_000) return 1.5;
    return fallback;
};

/**
 * Export a DOM element to PDF
 */
export async function exportToPDF(
    element: HTMLElement,
    options: PDFExportOptions = {}
): Promise<boolean> {
    const {
        filename = 'report.pdf',
        title,
        subtitle,
        orientation = 'portrait',
        format = 'a4',
        scale,
        imageType = 'png',
        imageQuality = 0.92
    } = options;

    const computedScale = scale ?? getRecommendedScale(element, 2);

    try {
        // Create canvas from HTML element
        const canvas = await html2canvas(element, {
            scale: computedScale, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL(imageType === 'jpeg' ? 'image/jpeg' : 'image/png', imageQuality);

        // Create PDF
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        // Add title if provided
        let yOffset = margin;
        if (title) {
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(title, pageWidth / 2, yOffset + 8, { align: 'center' });
            yOffset += 12;
        }

        if (subtitle) {
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text(subtitle, pageWidth / 2, yOffset + 4, { align: 'center' });
            yOffset += 10;
            pdf.setTextColor(0, 0, 0);
        }

        // Calculate image dimensions to fit page
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = pageHeight - yOffset - margin;

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);

        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;

        // Center horizontally
        const xOffset = (pageWidth - scaledWidth) / 2;

        // Add image to PDF
        pdf.addImage(imgData, imageType === 'jpeg' ? 'JPEG' : 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);

        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const today = new Date().toLocaleDateString('ko-KR');
        pdf.text(`생성일: ${today} | 성과평가 시스템`, pageWidth / 2, pageHeight - 5, { align: 'center' });

        // Save the PDF
        pdf.save(filename);

        return true;
    } catch (error) {
        console.error('PDF 내보내기 실패:', error);
        return false;
    }
}

/**
 * Export Dashboard to PDF
 */
export async function exportDashboardToPDF(
    dashboardElement: HTMLElement,
    teamName?: string
): Promise<boolean> {
    const title = teamName
        ? `${teamName} 성과 리포트`
        : '클라우드사업본부 성과 리포트';
    const subtitle = `${new Date().toLocaleDateString('ko-KR')} 기준`;

    return exportToPDF(dashboardElement, {
        filename: `performance_report_${Date.now()}.pdf`,
        title,
        subtitle,
        orientation: 'portrait'
    });
}

/**
 * Export Evaluation Result to PDF
 */
export async function exportEvaluationResultToPDF(
    resultElement: HTMLElement,
    evaluatorName: string,
    evaluationTitle: string
): Promise<boolean> {
    return exportToPDF(resultElement, {
        filename: `evaluation_${evaluatorName}_${Date.now()}.pdf`,
        title: evaluationTitle,
        subtitle: `평가자: ${evaluatorName}`,
        orientation: 'portrait'
    });
}

/**
 * Create printable wrapper for export
 * Clones the element and applies print-friendly styles
 */
export function createPrintableWrapper(
    element: HTMLElement,
    additionalStyles?: string
): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        background: white;
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
        ${additionalStyles || ''}
    `;

    // Clone the content
    wrapper.appendChild(element.cloneNode(true));

    // Remove interactive elements
    wrapper.querySelectorAll('button, input, select').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });

    return wrapper;
}
