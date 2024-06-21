// import React, { useState } from 'react';
// import 'flowbite/dist/flowbite.css';
// import User from '../components/User';
// import ResepMakanan from '../components/ResepMakanan';

// const Sidebar = () => {
//     const [open, setOpen] = useState(false);
//     const [activeMenu, setActiveMenu] = useState('user');

//     const Menu = [
//         { title: "Informasi User", src: "userAdmin", id: "user" },
//         { title: "Data Makanan", src: "Resep", id: "Makanan" },
//         { title: "Log Out", src: "logoutAdmin" },
//     ];

//     return (
//         <div className='flex'>
//             <div className={`${open ? "w-72" : "w-20"} duration-500 h-screen bg-Sidebar fixed`}>
//                 <img
//                     src="./src/assets/control.png"
//                     className={`${open ? "rotate-0" : "rotate-180"} w-7 p-1 bg-white absolute 
//                       cursor-pointer -right-3 rounded-full top-16 border-2 border-dark-purple`}
//                     alt="control"
//                     onClick={() => setOpen(!open)}
//                 />

//                 <div className='m-3 ' >
//                     <img src="./src/assets/LOGO.png" alt="" className={`${open ? "w-30" : "w-16"} cursor-pointer duration-500 p-2 bg-white border-green-600 rounded-sm`}
//                         onClick={() => setOpen(!open)}
//                     />
//                 </div>

//                 <ul className='pt-6 m-3'>
//                     {Menu.map((menu, index) => (
//                         <li key={index} className={`text-gray-300 text-sm font-semibold flex items-center
//                         gap-x-4 cursor-pointer p-2 rounded-md hover:bg-gray-400 hover:bg-opacity-10 hover:duration-100 ${menu.gap ? "mt-9" : "mt-2"}`}
//                             onClick={() => setActiveMenu(menu.id)}
//                         >
//                             <img src={`./src/assets/${menu.src}.png`} alt="" className='w-7 bg-white rounded-full p-1 hover:bg-white' />
//                             <span className={`${!open && 'hidden'} origin-left duration-50 `}>{menu.title}</span>
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             <div className={`${open ? "ml-72" : "ml-20"} p-7 w-full text-2xl font-semibold h-auto bg-gray-100`}>

//                 {activeMenu === 'user' && (
//                     <>
                        // <div className='ml-10 mb-10'>
                        //     <h1 className='text-4xl font-bold font-poppins'>Selamat Datang</h1>
                        //     <h3 className='text-2xl font-bold font-poppins'>di Halaman Admin Kitchen Craft</h3>
                            // <form className="w-[400px] mt-7">
                            //     <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                            //     <div className="relative">
                            //         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            //             <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            //                 <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            //             </svg>
                            //         </div>
                            //         <input type="search" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search User" required />
                            //         <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                            //     </div>
                            // </form>
                        // </div>
//                         <div className='w-full bg-white rounded-md flex gap-2'>
//                             <User />
//                         </div>
//                     </>
                    
//                 )}
//                 {activeMenu === 'Makanan' && (

//                     <>
//                      <form className="w-[400px] mt-3 mb">
//                                 <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                                         <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
//                                             <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
//                                         </svg>
//                                     </div>
//                                     <input type="search" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search User" required />
//                                     <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
//                                 </div>
//                             </form>
//                         <div className='w-full bg-white rounded-md flex gap-2 justify-center'>
//                             <ResepMakanan />
//                         </div>
//                     </>

//                 )}
//             </div>
//         </div>
//     );
// };

// export default Sidebar;
