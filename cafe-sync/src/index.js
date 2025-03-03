//src/index.js

import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux"; // ✅ Redux Provider 추가
import store from "./redux/store"; // ✅ store import
import ChatSocketProvider from "./redux/ChatSocketProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ChatSocketProvider>{<App />}</ChatSocketProvider>
  </Provider>
);
