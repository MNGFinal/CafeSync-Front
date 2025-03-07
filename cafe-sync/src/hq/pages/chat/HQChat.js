import styles from "./HQChat.module.css";
import HQEmployee from "./HQEmployee";
import HQRoom from "./HQRoom";
import HQChatting from "./HQChatting";

function Chat() {
  return (
    <>
      <div className="page-header">
        <h3>실시간 채팅</h3>
      </div>
      <div className={styles.container}>
        <div className={styles.empBox}>
          <HQEmployee />
        </div>
        <div className={styles.roomBox}>
          <HQRoom />
        </div>
        <div className={styles.chatBox}>
          <HQChatting />
        </div>
      </div>
    </>
  );
}

export default Chat;
