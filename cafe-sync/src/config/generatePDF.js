import jsPDF from "jspdf";
import "jspdf-autotable";

const getBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // Base64 데이터만 추출
    reader.readAsDataURL(blob);
  });
};

const generatePDF = async (data) => {
  const doc = new jsPDF();

  // ✅ 폰트 파일을 Base64로 변환 후 적용
  const fontUrl = "/fonts/NotoSansKR-VariableFont_wght.ttf"; // public 폴더 기준
  const fontBase64 = await getBase64(fontUrl);

  // ✅ 한글 폰트 추가
  doc.addFileToVFS("NotoSansKR.ttf", fontBase64);
  doc.addFont("NotoSansKR.ttf", "NotoSansKR", "normal");
  doc.setFont("NotoSansKR");

  doc.text("재고 목록", 14, 10); // ✅ 한글 정상 출력

  // 테이블 데이터 생성
  const tableColumn = [
    "제품 코드",
    "제품명",
    "유통기한",
    "보유수량",
    "발주수량",
    "권장수량",
    "공급업체",
  ];
  const tableRows = data.map((item) => [
    item.inventory.invenCode,
    item.inventory.invenName,
    item.inventory.expirationDate
      ? new Date(item.inventory.expirationDate).toISOString().slice(0, 10)
      : "N/A",
    item.stockQty,
    item.orderQty,
    item.recommQty,
    item.inventory.vendor.venName,
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: {
      font: "NotoSansKR", // ✅ 한글 폰트 적용
      halign: "center", // ✅ 텍스트 가운데 정렬
    },
    headStyles: {
      fillColor: [41, 128, 185], // ✅ 테이블 헤더 색상 (파란색 계열)
      halign: "center", // ✅ 헤더 텍스트 가운데 정렬
      fontStyle: "bold", // ✅ 헤더 글씨 굵게
      textColor: [255, 255, 255], // ✅ 헤더 글씨 흰색
    },
    columnStyles: {
      0: { halign: "center" }, // ✅ "제품 코드" 컬럼 가운데 정렬
      1: { halign: "center" }, // ✅ "제품명" 컬럼 가운데 정렬
      2: { halign: "center" }, // ✅ "유통기한" 컬럼 가운데 정렬
      3: { halign: "center" }, // ✅ "보유수량" 컬럼 가운데 정렬
      4: { halign: "center" }, // ✅ "발주수량" 컬럼 가운데 정렬
      5: { halign: "center" }, // ✅ "권장수량" 컬럼 가운데 정렬
      6: { halign: "center" }, // ✅ "공급업체" 컬럼 가운데 정렬
    },
  });

  // PDF 다운로드
  doc.save("재고_목록.pdf");
};

export default generatePDF;
