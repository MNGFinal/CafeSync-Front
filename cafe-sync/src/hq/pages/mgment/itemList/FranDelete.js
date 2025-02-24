import { deleteFran } from "../../../../apis/mgment/mgmentApi"; 

function FranDelete({ selectedFran, onDeleteSuccess }) {

    // ✅ 삭제 기능
    const handleDeleteFran = async () => {
        if (!selectedFran) return;
        const confirmDelete = window.confirm(`${selectedFran.franName} 가맹점을 폐점하시겠습니까?`);
        if (!confirmDelete) return;

        const success = await deleteFran(selectedFran.franCode);
        if (success) {
            alert("가맹점 삭제 성공!");
            onDeleteSuccess(selectedFran.franCode); // ✅ 부모 컴포넌트에서 리스트 갱신 처리
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
