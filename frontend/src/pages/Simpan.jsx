import React, { useState } from 'react';
import Card from '../components/common/Card';
import Logo from "../assets/contoh.jpg";
import RoundedButton from '../components/common/RoundedButton';

const Simpan = () => {
    // State to keep track of the active tab, initialized to 'Makanan'
    const [activeTab, setActiveTab] = useState('Makanan');

    return (

        <main className='mx-auto my-24 w-full min-w-[360px] max-w-[1080px] '>

            <div className='border-b-2 border-gray-200 mx-5 '>
                <div className='py-5' >
                    <div className='flex items-center gap-5  pt-8 pl-2'>
                        <img src={Logo} alt="" className='rounded-full bg-black w-20' />
                        <h2 className='font-semibold text-2xl'>Harun Darat S.kom</h2>
                    </div>
                    <RoundedButton name='Setting' className='text-black bg-white border-black absolute end-7 top-[200px] lg:top-[110px] lg:end-44' />

                </div>
            </div>
           


            <div className=' flex gap-10 justify-center mt-10'>
                <button className={`text-black font-semibold pb-2 w-36 ${activeTab === 'Makanan' ? 'border-b-4 border-red-500 rounded' : 'border-b-4 border-gray-300'}`} onClick={()=>setActiveTab('Makanan')}>Makanan</button>
                <button className={`text-black font-semibold pb-2 w-36 ${activeTab === 'Resep' ? 'border-b-4 border-red-500' : 'border-b-4 border-gray-300'}`} onClick={() => setActiveTab('Resep')}>Resep</button>
            </div>

            <div className='content'>
                {activeTab === 'Makanan' && (
                    <div className='mx-auto my-10 w-full min-w-[360px] max-w-[1080px] px-5  lg:mx-auto lg:px-0'>
                        <section className="mx-auto mt-2 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
                            <Card
                                id="11111"
                                title="Martabak m"
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="45 min"
                                likes="242"
                                creatorName="Harun Buaran"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                            <Card
                                id="3333"
                                title="Martabak Manis Cokelat "
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="30 min"
                                likes="134"
                                creatorName="Harun Buaran"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                            <Card
                                id="22222"
                                title="Martabak Manis Cokelat Dengan Rasa yangg Lebih Nikmat dan Sangar"
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="60 min"
                                likes="421"
                                creatorName="Harun Buaran"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                            <Card
                                id="0000111"
                                title="Martabak Keju Cokelat Teflon"
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="15 min"
                                likes="312"
                                creatorName="Harun Buaran"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                        </section>     
                    </div>
                )}

                {activeTab === 'Resep' && (
                    
                    <div className='mx-auto my-10 w-full min-w-[360px] max-w-[1080px] px-5  lg:mx-auto lg:px-0'>
                        <section className="mx-auto mt-2 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
                            <Card
                                id="11111"
                                title="Martabak m"
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="45 min"
                                likes="242"
                                creatorName="Ustadz Yusuf"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                            <Card
                                id="3333"
                                title="Martabak Manis Cokelat "
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="30 min"
                                likes="134"
                                creatorName="Ustadz Yusuf"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                            <Card
                                id="22222"
                                title="Martabak Manis Cokelat Dengan Rasa yangg Lebih Nikmat dan Sangar"
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="60 min"
                                likes="421"
                                creatorName="Ustadz Yusuf"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                            <Card
                                id="0000111"
                                title="Martabak Keju Cokelat Teflon"
                                image="https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2021/12/14/578376422.jpg"
                                time="15 min"
                                likes="312"
                                creatorName="Ustadz Yusuf"
                                creatorImage="https://media.sproutsocial.com/uploads/2022/06/profile-picture.jpeg"
                            />
                        </section>                     
                    </div>

                )}
            </div>

        </main>


    );
};

export default Simpan;
