// ✅ 가맹점 조회 (GET 요청)
export async function fetchFrans() {
    try {
        const response = await fetch("http://localhost:8080/api/hq/mgment"); // ✅ fetchFrans()가 아니라 fetch() 호출
        if (!response.ok) throw new Error("데이터 로드 실패");

        const res = await response.json();
        console.log("서버에서 가맹점리스트 받아옴", res);

        return res.data; // ✅ API에서 가져온 데이터 반환
    } catch (error) {
        console.error("가맹점 데이터 로딩 실패:", error);
        return []; // ✅ 에러 발생 시 빈 배열 반환 (UI 깨짐 방지)
    }
}


export async function registFran(franData) {
    try {
        const response = await fetch("http://localhost:8080/api/hq/mgment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // JSON으로 전송
            },
            body: JSON.stringify(franData),
        });

        if (!response.ok) throw new Error("가맹점 등록 실패");

        const res = await response.json();
        console.log("가맹점 등록 성공:", res);
        return res; // 성공 시 API 응답 반환
    } catch (error) {
        console.error("가맹점 등록 실패:", error);
        throw error;
    }
}