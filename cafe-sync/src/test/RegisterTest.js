import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterTest() {
  const [form, setForm] = useState({
    userId: "",
    userPass: "",
    empCode: "",
    email: "",
    authority: "", // ✅ 기본값 제거 (사용자가 선택해야 함)
    jobCode: "", // ✅ 직급 코드 선택하도록 수정
    storeCode: "",
  });

  const navigate = useNavigate();

  // 직급 코드 목록
  const jobOptions = [
    { value: 1, label: "대표이사" },
    { value: 2, label: "전무" },
    { value: 3, label: "상무" },
    { value: 4, label: "이사" },
    { value: 5, label: "부장" },
    { value: 6, label: "차장" },
    { value: 7, label: "과장" },
    { value: 8, label: "대리" },
    { value: 9, label: "주임" },
    { value: 10, label: "사원" },
    { value: 11, label: "인턴" },
    { value: 21, label: "점장" },
    { value: 22, label: "바리스타" },
  ];

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 회원가입 요청 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 간단한 유효성 검사
    if (
      !form.userId ||
      !form.userPass ||
      !form.email ||
      !form.authority ||
      !form.jobCode
    ) {
      alert(
        "아이디, 비밀번호, 이메일, 권한, 직급 코드는 필수 입력 항목입니다."
      );
      return;
    }

    try {
      const response = await fetch(
        "cafesync-back-production.up.railway.app/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (response.ok) {
        alert("회원가입 성공! 홈으로 이동합니다.");
        navigate("/"); // ✅ 기본 페이지("/")로 이동
      } else {
        const errorData = await response.json();
        alert(`회원가입 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error("회원가입 요청 중 오류 발생:", error);
      alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="register-form">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="userId">아이디</label>
          <input
            type="text"
            id="userId"
            name="userId"
            placeholder="아이디를 입력하세요"
            value={form.userId}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label htmlFor="userPass">비밀번호</label>
          <input
            type="password"
            id="userPass"
            name="userPass"
            placeholder="비밀번호를 입력하세요"
            value={form.userPass}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="이메일을 입력하세요"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* ✅ 권한 선택 */}
        <div className="input-group">
          <label htmlFor="authority">권한</label>
          <select
            id="authority"
            name="authority"
            value={form.authority}
            onChange={handleChange}
          >
            <option value="">권한을 선택하세요</option>
            <option value="ADMIN">관리자</option>
            <option value="USER">사용자</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="empCode">사원 코드</label>
          <input
            type="number"
            id="empCode"
            name="empCode"
            placeholder="사원 코드를 입력하세요"
            value={form.empCode}
            onChange={handleChange}
          />
        </div>

        {/* ✅ 직급 코드 선택 (셀렉트 박스) */}
        <div className="input-group">
          <label htmlFor="jobCode">직급 코드</label>
          <select
            id="jobCode"
            name="jobCode"
            value={form.jobCode}
            onChange={handleChange}
          >
            <option value="">직급을 선택하세요</option>
            {jobOptions.map((job) => (
              <option key={job.value} value={job.value}>
                {job.label}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="storeCode">매장 코드</label>
          <input
            type="number"
            id="storeCode"
            name="storeCode"
            placeholder="매장 코드를 입력하세요"
            value={form.storeCode}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn">
          회원가입
        </button>
      </form>
    </div>
  );
}

export default RegisterTest;
