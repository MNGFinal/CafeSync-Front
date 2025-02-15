import style from './Modal.module.css';

const Modal = ({ isOpen, onClose, children }) => {
    /*
        isOpen : 모달의 열림/닫힘 상태, boolean형. true면 열린 상태
        isClose : 모달을 닫는 역할을 하는 함수. X 버튼 누르면 동작하도록 설정.
        children : 모달 내부의 콘텐츠.

        사용 방법 : import 후 <Modal></Modal> 내부에 children이 될 내용을 작성하기!
    */
    if (!isOpen) return null;  // 모달이 닫혀 있으면 렌더링 안 함

    return (
        <div className={style.modalOverlay}>
            <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={style.closeButton} onClick={onClose}>X</button>
                
                {/* 모달 내부 콘텐츠 */}
                {children}
            </div>
        </div>
    )
}

export default Modal;