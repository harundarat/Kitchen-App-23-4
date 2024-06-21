import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ResepMakanan from './components/ResepMakanan';
import DetailResep from './components/DetailResep';
import SideNav from './components/SideNav';
import User from './components/User';
import DetailUser from './components/DetailUser'; // Import DetailUser

const App = () => {
  const [open, setOpen] = useState(true); // State untuk mengontrol lebar SideNav

  return (
    <div className="flex h-screen overflow-hidden"> {/* overflow-hidden untuk menghilangkan scroll bar */}
      <SideNav open={open} setOpen={setOpen} />
      <div className={`flex-grow p-5 overflow-y-auto`}> {/* overflow-y-auto untuk membuat konten utama dapat digulir */}
        <Routes>
          <Route path="/" element={<User />} />
          <Route path="/ResepMakanan" element={<ResepMakanan />} />
          <Route path="/DetailResep/:id" element={<DetailResep />} />
          <Route path="/DetailUser/:id" element={<DetailUser />} /> {/* Tambah Route untuk DetailUser */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
