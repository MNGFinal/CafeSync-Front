import storage from "../firebase/firebase.js"; // ✅ `import` 방식 사용
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from "fs";
import path from "path";

// 🔹 업로드할 이미지 폴더와 파일 목록
const files = {
  menu: ["iceAmericano.jpg"],
};

// 🔹 Firebase Storage에 업로드하는 함수
const uploadFiles = async () => {
  for (const folder in files) {
    for (const fileName of files[folder]) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "images",
        folder,
        fileName
      ); // ✅ 로컬 파일 절대경로 설정
      console.log(`📂 파일 경로 확인: ${filePath}`);

      try {
        const fileBuffer = fs.readFileSync(filePath); // ✅ 파일 읽기 (Buffer 형태)
        const storageRef = ref(storage, `${folder}/${fileName}`); // Firebase Storage 경로
        await uploadBytes(storageRef, fileBuffer);
        const downloadURL = await getDownloadURL(storageRef);

        console.log(`✅ ${folder}/${fileName} 업로드 완료: ${downloadURL}`);
      } catch (error) {
        console.error(`❌ ${folder}/${fileName} 업로드 실패: ${error.message}`);
      }
    }
  }
};

uploadFiles();
