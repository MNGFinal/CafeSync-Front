import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmWiJYknzLM3RUPTx4WTW6XPaTN6mfIXM",
  authDomain: "cafe-sync.firebaseapp.com",
  projectId: "cafe-sync",
  storageBucket: "cafe-sync.firebasestorage.app",
  messagingSenderId: "792625136221",
  appId: "1:792625136221:web:fe21f3868b34c0239f83b4",
  measurementId: "G-KZJXYYBJXB",
};

// 🔹 Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ✅ **이미지 URL을 가져오는 함수 (수정됨!)**
const getImageUrl = async (folder, filename) => {
  try {
    const imageRef = ref(storage, `${folder}/${filename}`); // 올바른 경로 설정
    const url = await getDownloadURL(imageRef);
    console.log(`🔹 이미지 URL 가져오기 성공: ${url}`); // ✅ 디버깅용 로그
    return url;
  } catch (error) {
    console.error(`❌ 이미지 가져오기 실패: ${folder}/${filename}`, error);
    return null;
  }
};

// 🔹 `storage` & `getImageUrl` export
export { storage, getImageUrl };
export default storage;
