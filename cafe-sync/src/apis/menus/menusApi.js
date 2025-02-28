export async function fetchMenus(category, searchQuery) {
    const categoryMap = {
        coffee: 1,
        drink: 2,
        dessert: 3,
        goods: 4,
    };

    const categoryCode = categoryMap[category];
    if (!categoryCode) return [];

    try {
        const response = await fetch(
            `http://localhost:8080/api/fran/menus/${categoryCode}?query=${searchQuery}`
        );
        const res = await response.json();

        console.log("✅ API에서 받은 데이터:", res);
        return res.data; // ✅ 실제 데이터 반환
    } catch (error) {
        console.error("❌ 메뉴 데이터 로딩 실패:", error);
        return [];
    }
}
