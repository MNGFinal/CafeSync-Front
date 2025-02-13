import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmWiJYknzLM3RUPTx4WTW6XPaTN6mfIXM",
  authDomain: "cafe-sync.firebaseapp.com",
  projectId: "cafe-sync",
  storageBucket: "cafe-sync.appspot.com", // ✅ 올바른 버킷 주소
  messagingSenderId: "792625136221",
  appId: "1:792625136221:web:fe21f3868b34c0239f83b4",
  measurementId: "G-KZJXYYBJXB",
};

// ✅ Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ✅ 이제 변환 함수 필요 없음!

export { storage };
export default storage;
