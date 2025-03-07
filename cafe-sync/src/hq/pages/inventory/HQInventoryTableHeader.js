function HQInventoryTableHeader({ onSelectAll, isAllSelected }) {
    return (
      <thead>
        <tr>
          <th>제품 사진</th>
          <th>제품 코드</th>
          <th>제품명</th>
          <th>유통기한</th>
          <th>보유수량</th>
          <th>공급업체</th>
        </tr>
      </thead>
    );
  }
  
  export default HQInventoryTableHeader;
  