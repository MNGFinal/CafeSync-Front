
import MenusLayout from '../layout/MenusLayout';
import MenusList from '../itemList/MenuList';
// import MenuModal from '../modal/MenuModal';



function Menus() {





  return (
    <>
      <div className="page-header">
        <h3>메뉴 관리</h3>
      </div>
      <MenusLayout />
      <MenusList />
      {/* <MenuModal /> */}

    </>
  );
}

export default Menus;
