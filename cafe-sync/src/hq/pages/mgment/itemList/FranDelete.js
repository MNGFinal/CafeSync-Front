import { deleteFran } from "../../../../apis/mgment/mgmentApi";

function FranDelete({ selectedFran, onDeleteSuccess }) {
  
  // ✅ 삭제 기능 함수
  const handleDeleteFran = async () => {
    if (!selectedFran) return;
    const confirmDelete = window.confirm(`${selectedFran.franName} 가맹점을 폐점하시겠습니까?`);
    if (!confirmDelete) return;

    const success = await deleteFran(selectedFran.franCode);
    if (success) {
      alert("가맹점 삭제 성공!");
      onDeleteSuccess(selectedFran.franCode); // ✅ 삭제 성공 후 리스트에서 제거
    } else {
      alert("가맹점 삭제 실패");
    }
  };

  return (
    <button onClick={handleDeleteFran} className="deleteButton">
      폐점
    </button>
  );
}

export default FranDelete;
