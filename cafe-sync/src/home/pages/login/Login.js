import "./Login.css";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="login-form">
      <header>
        <img
          src="/images/logo/cafe-sync-logo2.png"
          alt="로그인 폼 로고"
          className="login-form-logo"
        />
      </header>

      <div className="input-group">
        <label htmlFor="username">아이디</label>
        <input type="text" id="username" placeholder="아이디를 입력하세요" />
      </div>

      <div className="input-group">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div className="container">
        <div className="id-save">
          <input type="checkbox" id="id-save" />
          <label htmlFor="id-save">아이디 저장</label>
        </div>

        <div className="find-box">
          <Link to="/find-id">아이디 찾기</Link>
          <Link to="/find-pass">비밀번호 찾기</Link>
        </div>
      </div>

      <button className="submit">로그인</button>
    </div>
  );
}

export default Login;
