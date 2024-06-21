import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SideNav = ({ open, setOpen }) => {
    const [activeMenu, setActiveMenu] = useState('user');
    const navigate = useNavigate();

    const Menu = [
        { title: "Informasi User", src: "userAdmin", id: "user", path: "/" },
        { title: "Data Makanan", src: "Resep", id: "Makanan", path: "/ResepMakanan" },
        { title: "Log Out", src: "logoutAdmin", path: "/logout" },
    ];

    const handleMenuClick = (id, path) => {
        setActiveMenu(id);
        navigate(path);
    };

    return (
        <div className={`bg-Sidebar ${open ? 'w-72' : 'w-20'} duration-500 h-full relative`}>
            <img
                src="/src/assets/control.png"
                className={`w-7 p-1 bg-white absolute cursor-pointer -right-3 top-16 rounded-full border-2 border-dark-purple ${open ? 'rotate-0' : 'rotate-180'}`}
                alt="control"
                onClick={() => setOpen(!open)}
            />
            <div className="m-3">
                <img
                    src="/src/assets/LOGO.png"
                    alt=""
                    className={`${open ? 'w-30' : 'w-16'} cursor-pointer duration-500 p-2 bg-white border-green-600 rounded-sm`}
                    onClick={() => setOpen(!open)}
                />
            </div>
            <ul className="pt-6 m-3">
                {Menu.map((menu, index) => (
                    <li
                        key={index}
                        className={`text-gray-300 text-sm font-semibold flex items-center gap-x-4 cursor-pointer p-2 rounded-md hover:bg-gray-400 hover:bg-opacity-10 ${menu.gap ? 'mt-9' : 'mt-2'} ${activeMenu === menu.id ? 'bg-gray-600' : ''}`}
                        onClick={() => handleMenuClick(menu.id, menu.path)}
                    >
                        <img src={`/src/assets/${menu.src}.png`} alt={menu.title} className="w-7 bg-white rounded-full p-1" />
                        <span className={`${!open && 'hidden'} origin-left duration-50`}>{menu.title}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SideNav;
