import { Outlet } from "react-router-dom";
import "./HomeLayout.css";

function LoginLayout() {
  return (
    <div className="default">
      <img
        src="/images/login/home-background.jpg"
        alt="홈 백그라운드"
        className="home-background"
      />
      <div className="form-box">
        <Outlet />
      </div>
    </div>
  );
}

export default LoginLayout;
