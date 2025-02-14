//src/index.js

import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux"; // ✅ Redux Provider 추가
import store from "./redux/store"; // ✅ store import
import BaristaNoteLayout from "./fran/pages/barista-note/BaristaNoteLayout";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
    <BaristaNoteLayout />
  </Provider>
);
