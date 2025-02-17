import style from './Modal.module.css';

const Modal = ({ isOpen, onClose, children, buttons = [], className = '' }) => {
    if (!isOpen) return null;  // 모달이 닫혀 있으면 렌더링 안 함

    return (
        <div className={style.modalOverlay}>
            <div className={style.modalContentS} onClick={(e) => e.stopPropagation()}>
                
                {/* 모달 내부 콘텐츠 */}
                {children}

                {/* 동적 버튼 렌더링 */}
                <div className={style.buttonContainer}>
                    {buttons.map((btn, index) => (
                        <button 
                            key={index} 
                            className={`${style.modalButton} ${btn.className || ''}`} 
                            onClick={btn.onClick}
                        >
                            {btn.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Modal;