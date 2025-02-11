
import MenusLayout from '../menus/MenusLayout';
import MenusList from '../menus/MenuList';
import MenuModal from '../menus/MenuModal';



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
