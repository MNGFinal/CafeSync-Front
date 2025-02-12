import style from '../modal/MenuModal.module';


export const MenuModal = () => {

    return (
        <div className={style.Overlay}>
            <div className={style.cartContainer}>

                <button>✖</button>

                <span>카테고리 이름</span>
                <hr /><br />
                <span>이미지</span><br />
                <br /><br /><br />
                <span>아이스 아메리카노</span><br />
                <span>Americano</span>
                <hr />
                <span>내용 설명</span>
                <hr />



                <button className={style.addCart} type="button">
                    Sold Out
                </button>
            </div>

        </div>


    );
};



export default MenuModal;