import { useEffect, useState } from "react";
import style from "../styles/Complain.module.css"
import Modal from "../../../../components/Modal"
import modalStyle from "../../../../components/ModalButton.module.css"

const complainDetail = ({complain, isModalOpen, setIsModalOpen}) => {

  // console.log('컴플레인 들어온 거', complain);

  return (
    <Modal
      isOpen= {isModalOpen}
      onClose= {() => setIsModalOpen(false)}
    >
      <h2 className={style.schH2}>컴플레인 상세 내용</h2>
      <hr />
      <div className={style.addTable}>
        <table>
          <tr>
            <th>컴플레인 접수 일자</th>
            <td>
              {complain.complainDate || "-"}
            </td>
          </tr>
          <tr>
            <th>컴플레인 구분</th>
            <td>
              {complain.complainDivision === 1 ? "서비스" : complain.complainDivision === 2 ? "위생" : "기타"}
            </td>
          </tr>
          <tr>
            <th>컴플레인 접수자</th>
            <td>
              {complain.empName}
            </td>
          </tr>
          <tr>
            <th>컴플레인 제출자 연락처</th>
            <td>
              {complain.customerPhone}
            </td>
          </tr>
          <tr>
            <th>컴플레인 내용</th>
          </tr>
        </table>
        <textarea className={style.addTextarea} name="complainDetail" value={complain.complainDetail} disabled/>
      </div>
    </Modal>
  );
}

export default complainDetail;