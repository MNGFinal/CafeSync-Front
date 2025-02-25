import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * PDF 파일을 생성하는 함수 (화면 디자인 유지)
 * @param {string} pdfTitle - PDF 제목 (예: "손익 계산서")
 * @param {string} targetId - 캡처할 HTML 요소의 ID
 */
const generatePDF = (pdfTitle, targetId) => {
  const element = document.getElementById(targetId); // 캡처할 요소 찾기
  if (!element) {
    alert("PDF로 변환할 내용을 찾을 수 없습니다.");
    return;
  }

  html2canvas(element, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png"); // 캡처된 화면을 이미지로 변환
    const pdf = new jsPDF("p", "mm", "a4"); // A4 크기의 PDF 생성

    const imgWidth = 210; // A4 너비 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // 비율 유지

    pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight); // PDF에 이미지 추가
    pdf.save(`${pdfTitle}.pdf`); // 파일 다운로드
  });
};

export default generatePDF;
