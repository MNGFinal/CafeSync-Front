import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Firebase Storage에 파일 업로드 후 다운로드 URL 반환
 */
export const uploadFileBaristaToFirebase = async (file) => {
  if (!file) return null;

  try {
    const storageRef = ref(storage, `barista-note/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // 진행 상태 로깅 (원하는 경우)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`파일 업로드 진행률: ${progress}%`);
        },
        (error) => {
          console.error("파일 업로드 실패:", error);
          reject(error);
        },
        async () => {
          // 업로드 성공 시 다운로드 URL 반환
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("✅ 파일 업로드 성공! 다운로드 URL:", downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error("🔥 파일 업로드 중 오류 발생:", error);
    return null;
  }
};
