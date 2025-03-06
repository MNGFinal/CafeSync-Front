// uploadImageToFirebase.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import storage from "./firebase";

export async function uploadProfileImageToFirebase(file) {
  try {
    // "vendor" 폴더에 업로드할 파일 경로 지정
    const fileRef = ref(storage, `profile/${Date.now()}_${file.name}`);
    // 파일 업로드
    await uploadBytes(fileRef, file);
    // 업로드 후 다운로드 URL 받아오기
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Firebase 이미지 업로드 실패:", error);
    throw error;
  }
}
