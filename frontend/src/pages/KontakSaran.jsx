import { useState } from "react"
import { Link } from "react-router-dom"


const KontakSaran = () => {

    const [saran, setSaran] = useState({
        email:'',
        pesan:'',
    })
    const handleChange = (e)=>{
       
        setSaran({...saran, [e.target.name] : e.target.value})
        console.log(saran)
    }
    const clickHandle = (e)=>{
        e.preventDefault()
        console.log(saran)
        setSaran({
            email: '',
            pesan: '',
        });
    }
  return (
    <div className='mt-28 p-5 md:px-32'>
        <div className='flex gap-1'>
            <Link to={'/about'} className="text-accent-1">
                About
            </Link>/
            <p>Kontak & Saran</p>
        </div>
        <section id='kontak' >
            <h2 className='text-[20px] md:text-[40px]'>
                Kontak
            </h2>
            <p className="text-[10px] md:text-[14px] text-justify">
            Kami di Kitchen Craft selalu siap membantu Anda. Jika Anda memiliki pertanyaan, masukan, atau memerlukan bantuan, jangan ragu untuk menghubungi kami melalui salah satu metode di bawah ini.

            </p><br />
            <h2 className='text-[20px] md:text-[40px]'>
                Email
            </h2>
            <p className="text-[10px] md:text-[14px] text-justify">
            Untuk pertanyaan umum, masalah teknis, atau dukungan pelanggan, silakan kirim email kepada kami di:
                <br />
            support@kitchencraft.com

            </p><br />
            <h2 className='text-[20px] md:text-[40px]'>
                Telepon
            </h2>
            <p className="text-[10px] md:text-[14px] text-justify">
            Tim dukungan pelanggan kami tersedia untuk membantu Anda melalui telepon pada hari kerja dari pukul 09.00 hingga 18.00 WIB. <br /> Nomor Telepon: +62 21 1234 5678
            </p>
            <h2 className='text-[20px] md:text-[40px]'>
            Alamat Kantor
            </h2>
            <p className="text-[10px] md:text-[14px] text-justify">
            Jika Anda ingin mengunjungi atau mengirim surat kepada kami, berikut adalah alamat kantor kami:
            <br />
            Kitchen Craft
            Jl. Makanan Sehat No. 123
            Jakarta, Indonesia
            </p><br />
            <h2 className='text-[20px] md:text-[40px]'>
            Media Sosial
            </h2>
            <p className="text-[10px] md:text-[14px] text-justify">
            Ikuti dan hubungi kami melalui media sosial untuk mendapatkan update terbaru dan berinteraksi dengan komunitas Kitchen Craft:
            <br />
            Facebook: Kitchen Craft Facebook <br />
            Twitter: @KitchenCraft <br />
            Instagram: @KitchenCraft <br />
            </p><br />
            <p className="text-[10px] md:text-[14px] text-justify">
            Kami menghargai setiap masukan dari pengguna kami dan berusaha memberikan layanan terbaik. Terima kasih telah memilih Kitchen Craft!</p>
        </section>
        <section  className='p-5 md:px-28'>
            <h2 className="text-[20px] md:text-[25px] lg:text-[35px] xl:text-[40px] text-center">Punya saran? Kirimkan Ke kami!</h2>
            <form className="mt-5" id='saran'>
                <div className="flex gap-5 items-center">
                    <p>Email</p>
                    <input 
                        type="email" 
                        name="email"
                        value={saran.email}
                        onChange={handleChange} 
                        className="border-2 w-full rounded-md py-2 px-6"
                        placeholder="me@email.com"/>
                </div>
                <div className="flex gap-5 items-center">
                    <p>Saran</p>
                    <input 
                        type="text" 
                        name="pesan"
                        value={saran.pesan}
                        onChange={handleChange} 
                        className="border-2 w-full rounded-md py-2 px-6 mt-2"
                        placeholder="Saran saya adalah"/>
                </div>
                <button className="rounded-xl px-6 py-2 bg-accent-1 text-white font-semibold mt-2 float-right mb-10"
                onClick={clickHandle}>
                    Kirim Saran Saya!
                </button>
            </form>
        </section>
    </div>
  )
}

export default KontakSaran