import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // ✅ Redux 사용
import { loginUser } from "../../../apis/home/HomeApi";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ userId: "", userPass: "" });
  const [isRemember, setIsRemember] = useState(false); // ✅ 아이디 저장 체크 여부
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, accessToken } = useSelector((state) => state.auth); // ✅ Redux에서 사용자 정보 & 토큰 가져오기

  // 🔹 컴포넌트 마운트 시 로컬 스토리지에서 아이디 불러오기
  useEffect(() => {
    const savedUserId = localStorage.getItem("savedUserId");
    if (savedUserId) {
      setForm((prevForm) => ({ ...prevForm, userId: savedUserId }));
      setIsRemember(true);
    }
  }, []);

  // 🔹 자동 로그인 (Redux에 사용자 정보 & 토큰이 존재할 때만 실행)
  useEffect(() => {
    if (user && user.authority !== "UNKNOWN" && accessToken) {
      console.log("✅ 자동 로그인 상태 유지 중:", user);
      handleNavigation(user.authority, user.jobCode);
    }
  }, [user, accessToken]); // ✅ Redux 상태가 변경될 때 실행

  // 🔹 입력 값 변경 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 아이디 저장 체크박스 변경 핸들러
  const handleCheckboxChange = (e) => {
    setIsRemember(e.target.checked);

    if (e.target.checked) {
      localStorage.setItem("savedUserId", form.userId); // ✅ 체크하면 아이디 저장
    } else {
      localStorage.removeItem("savedUserId"); // ✅ 체크 해제하면 아이디 삭제
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("🔄 로그인 요청 시작");
      const userData = await loginUser(form); // ✅ 로그인 API 호출

      console.log("✅ 로그인 성공 (백엔드 응답 데이터):", userData); // 🚨 job 데이터 확인용 추가!

      if (isRemember) {
        localStorage.setItem("savedUserId", form.userId); // ✅ 체크 상태일 때 아이디 저장
      } else {
        localStorage.removeItem("savedUserId"); // ✅ 체크 해제하면 아이디 삭제
      }

      // ✅ `userData.job?.jobCode` 값이 없으면 기본값 0으로 설정
      const jobCode =
        userData.job && userData.job.jobCode ? userData.job.jobCode : null;

      handleNavigation(userData.authority, jobCode);
    } catch (error) {
      console.error("🚨 로그인 오류:", error);
      alert(error.message || "서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleNavigation = (authority, jobCode) => {
    if (authority === "ADMIN" && jobCode >= 1 && jobCode <= 11) {
      console.log("🏢 본사 페이지로 이동 (/hq)");
      navigate("/hq");
    } else if (
      (authority === "ADMIN" || authority === "USER") &&
      (jobCode === 21 || jobCode === 22)
    ) {
      console.log("🏪 가맹점 페이지로 이동 (/fran)");
      navigate("/fran");
    }
  };

  return (
    <div className="login-form">
      <header>
        <img
          src="/images/logo/cafe-sync-logo2.png"
          alt="로그인 폼 로고"
          className="login-form-logo"
        />
      </header>

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

        <div className="container">
          <div className="id-save">
            <input
              type="checkbox"
              id="id-save"
              checked={isRemember}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="id-save">아이디 저장</label>
          </div>

          <div className="find-box">
            <Link to="/find-id">아이디 찾기</Link>
            <Link to="/find-pass">비밀번호 찾기</Link>
          </div>
        </div>

        <button type="submit" className="submit">
          로그인
        </button>
      </form>
    </div>
  );
}

export default Login;
