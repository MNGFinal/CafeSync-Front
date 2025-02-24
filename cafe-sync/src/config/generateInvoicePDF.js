import jsPDF from "jspdf";
import "jspdf-autotable";

// ✅ Base64 변환하는 함수 (한글 폰트 적용)
const getBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // Base64 데이터만 추출
    reader.readAsDataURL(blob);
  });
};

// ✅ 사업자 등록번호 포맷팅 함수 (111-11-1111 형식)
const formatBusinessNumber = (num) => {
  if (!num) return "-";
  return num.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
};

// ✅ 세금 계산서 PDF 생성 함수
const generateTaxInvoicePDF = async (invoice) => {
  const doc = new jsPDF();

  // ✅ 한글 폰트 파일을 Base64로 변환 후 적용
  const fontUrl = "/fonts/NotoSansKR-Regular.ttf"; // public 폴더 기준
  const fontBase64 = await getBase64(fontUrl);

  doc.addFileToVFS("NotoSansKR-Regular.ttf", fontBase64);
  doc.addFont("NotoSansKR-Regular.ttf", "NotoSansKR", "normal");
  doc.setFont("NotoSansKR");

  // ✅ 제목을 **날짜만** 표시하도록 수정
  doc.setFontSize(18);
  doc.setFont("NotoSansKR", "bold");

  const title = invoice.taxDate; // 🔥 **날짜만 표시**
  const pageWidth = doc.internal.pageSize.width;
  const textWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - textWidth) / 2, 15);

  // ✅ 숫자 변환 함수 (toLocaleString() 적용)
  const formatNumber = (num) => (num ? num.toLocaleString("ko-KR") : "0");

  // ✅ 테이블 데이터 (colSpan 적용)
  const tableColumn = [
    ["세금 계산서 번호", invoice.taxId, "발행 일자", invoice.taxDate],
    [
      "공급자",
      invoice.slip?.venCode?.venName,
      "사업자등록번호",
      formatBusinessNumber(invoice.slip?.venCode?.businessNum), // 🔥 **사업자번호 변환**
    ],
    [
      {
        content: "공급자 주소",
        styles: { fontStyle: "bold", halign: "center" },
      },
      { content: invoice.slip?.venCode?.venAddr || "-", colSpan: 3 },
    ],
    [
      "공급받는자",
      invoice.franchise?.franName,
      "전표 구분",
      invoice.slip?.slipDivision,
    ],
    [
      {
        content: "공급받는자 주소",
        styles: { fontStyle: "bold", halign: "center" },
      },
      { content: invoice.franchise?.franAddress || "-", colSpan: 3 },
    ],
    [
      "계정과목 코드",
      invoice.slip?.actCode?.actCode,
      "계정과목명",
      invoice.slip?.actCode?.actName,
    ],
    [
      "적요 코드",
      invoice.slip?.summaryCode?.summaryCode,
      "적요명",
      invoice.slip?.summaryCode?.summaryName,
    ],
    [
      {
        content: "세액",
        styles: { fontStyle: "bold", halign: "center" },
      },
      { content: `${formatNumber(invoice.taxVal)} 원`, colSpan: 3 },
    ],
    [
      {
        content: "합계",
        styles: { fontStyle: "bold", halign: "center" },
      },
      {
        content: `${formatNumber(
          (invoice.slip?.debit || 0) + (invoice.slip?.credit || 0)
        )} 원`,
        colSpan: 3,
      },
    ],
  ];

  // ✅ 테이블 스타일 적용
  doc.autoTable({
    body: tableColumn,
    startY: 25,
    theme: "grid",
    styles: { font: "NotoSansKR", halign: "center" },
    headStyles: {
      fillColor: [0, 78, 152],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [230, 245, 255] },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [0, 78, 152] },
      2: { fontStyle: "bold", textColor: [0, 78, 152] },
    },
  });

  // ✅ PDF 저장
  doc.save(`세금계산서_${invoice.taxId}.pdf`);
};

export default generateTaxInvoicePDF;
