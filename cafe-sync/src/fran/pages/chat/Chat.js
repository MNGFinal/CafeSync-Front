import styles from "./Chat.module.css";
import Employee from "./Employee";
import Room from "./Room";
import Chatting from "./Chatting";

function Chat() {
  return (
    <>
      <div className="page-header">
        <h3>실시간 채팅</h3>
      </div>
      <div className={styles.container}>
        <div className={styles.empBox}>
          <Employee />
        </div>
        <div className={styles.roomBox}>
          <Room />
        </div>
        <div className={styles.chatBox}>
          <Chatting />
        </div>
      </div>
    </>
  );
}

export default Chat;
