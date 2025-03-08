import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Redux 사용
import { logout, setCredentials } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import "./common.css";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux에서 사용자 정보, 만료 시각, Refresh Token 가져오기
  const { user, expireTime, refreshToken } = useSelector((state) => state.auth);
  const franName = user?.franchise?.franName || "알 수 없음";
  const name = user?.employee?.empName || "알 수 없음";
  const jobName = user?.job?.jobName || "알 수 없음";

  // 남은 시간을 초 단위로 저장하는 상태
  const [timeLeft, setTimeLeft] = useState(0);

  // 타이머: expireTime 기준 남은 시간 계산 및 자동 로그아웃
  useEffect(() => {
    if (!expireTime) return;

    const intervalId = setInterval(() => {
      const diff = expireTime - Date.now();
      if (diff <= 0) {
        console.log("⏰ 토큰 만료 → 자동 로그아웃 실행");
        dispatch(logout());
        sessionStorage.clear();
        navigate("/");
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [expireTime, dispatch, navigate]);

  // 타이머를 mm:ss 형식으로 포맷팅하는 함수
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs < 10 ? "0" : ""}${secs}초`;
  };

  // 세션 연장 함수: Refresh Token을 이용해 새로운 Access Token 발급 및 만료 시각 갱신
  const handleExtendSession = async () => {
    console.log("토큰 연장 요청 시작 - refreshToken:", refreshToken);
    try {
      const response = await fetch("http://localhost:8080/api/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      console.log("Refresh Token 응답 상태:", response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Refresh Token 응답 에러:", errorData);
        throw new Error("토큰 연장 실패");
      }
      const data = await response.json();
      console.log("🔄 토큰 연장 응답 데이터:", data);

      const newExpireTime = Date.now() + 15 * 60 * 1000;
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken, // 기존 값 유지
          user,
          expireTime: newExpireTime,
        })
      );

      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("expireTime", newExpireTime.toString());
      alert("세션이 15분 연장되었습니다!");
    } catch (error) {
      console.error("세션 연장 중 오류:", error);
      alert("세션 연장 실패, 다시 로그인해주세요.");
      dispatch(logout());
      sessionStorage.clear();
      navigate("/");
    }
  };

  // 수동 로그아웃 함수: 버튼 클릭 시 확인창 표시
  const onLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      dispatch(logout());
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="header">
      {/* 왼쪽: 로고 */}
      <img src="/images/logo/cafe-sync-logo1.png" className="logo" alt="logo" />

      {/* 가운데: 가맹점 + 직원 이름 + 직급 표시 */}
      <div className="fran-name">
        {franName} - {name} {jobName}
      </div>

      {/* 오른쪽: 남은 시간, 세션 연장 버튼, 로그아웃 버튼 */}
      <div>
        {timeLeft > 0 && (
          <span
            style={{ marginRight: "10px", color: "red", fontWeight: "bold" }}
          >
            남은 시간: {formatTime(timeLeft)}
          </span>
        )}
        <button onClick={handleExtendSession} className="extend-btn">
          연장
        </button>
        <button className="logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default Header;
