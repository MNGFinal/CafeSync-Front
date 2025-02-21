import jsPDF from "jspdf";
import "jspdf-autotable";

// ✅ Base64로 변환하는 함수 (한글 폰트 적용)
const getBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // Base64 데이터만 추출
    reader.readAsDataURL(blob);
  });
};

// ✅ 한글 폰트 적용 + 발주 신청 내역 PDF 생성
const generateOrderPDF = async (data, franName, orderDate) => {
  const doc = new jsPDF();

  // ✅ 한글 폰트 파일을 Base64로 변환 후 적용
  const fontUrl = "/fonts/NotoSansKR-VariableFont_wght.ttf"; // public 폴더 기준
  const fontBase64 = await getBase64(fontUrl);

  doc.addFileToVFS("NotoSansKR.ttf", fontBase64);
  doc.addFont("NotoSansKR.ttf", "NotoSansKR", "normal");
  doc.setFont("NotoSansKR");

  // ✅ 제목 (가맹점명 + 날짜 추가)
  doc.setFontSize(16);
  doc.text(`[${franName}] ${orderDate} 발주 신청 내역`, 14, 10);

  // ✅ 필요한 테이블 헤더만 설정
  const tableColumn = ["제품 코드", "제품명", "발주 수량"];
  const tableRows = data.map((item) => [
    item.invenCode, // 제품 코드
    item.invenName, // 제품명
    item.orderQty, // 발주 수량
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { font: "NotoSansKR", halign: "center" }, // ✅ 한글 폰트 적용
    headStyles: {
      fillColor: [30, 136, 229], // ✅ 헤더 색상 (더 진한 파랑)
      halign: "center",
      fontStyle: "bold",
      textColor: [255, 255, 255], // ✅ 헤더 글씨 흰색
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }, // ✅ 행 색 번갈아 적용 (연한 회색)
  });

  doc.save("발주_신청_내역.pdf");
};

export default generateOrderPDF;
