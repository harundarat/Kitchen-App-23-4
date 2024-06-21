import { Icon } from "@iconify/react";
import Card from "../components/common/Card";

const Resep = () => {
  return (
    <div className="md:px-20 xl:px-20">
      {/* HEADER */}
      <img
        src="/resep/header.svg"
        className="mx-auto md:mt-32 md:w-[900px] xl:mt-32 xl:w-[1080px]"
      />
      {/* MAIN */}
      <div className="flex flex-col md:flex-col lg:flex-col xl:flex-row">
        {/* KIRI */}
        {/* LIKE SHARE SIMPAN */}
        <div className="flex-initial p-5">
          <div className="flex justify-between">
            <div className="flex gap-5">
              <div className="flexp flex-col items-center">
                <Icon
                  icon="mingcute:heart-line"
                  className="text-[10px] text-black md:text-[20px] xl:text-[20px]"
                ></Icon>
                <p className="text-[7px] md:text-[14px]">1.2k</p>
              </div>
              <div className="flexp flex-col items-center">
                <Icon
                  icon="material-symbols:bookmark-outline"
                  className="mx-auto text-[10px] text-black md:text-[20px] xl:text-[20px]"
                ></Icon>
                <p className="text-[7px] md:text-[14px]">Simpan</p>
              </div>
              <div className="flexp flex-col items-center">
                <Icon
                  icon="material-symbols:share-outline"
                  className="mx-auto text-[10px] text-black md:text-[20px] xl:text-[20px]"
                ></Icon>
                <p className="text-[7px] md:text-[14px]">Bagikan</p>
              </div>
            </div>
            <div className="hidden w-fit items-center gap-1 rounded-full bg-accent-2 px-4 py-1 text-bg md:flex md:h-[31px] md:w-[83px]">
              <Icon className="text-sm" icon="mingcute:time-line" />
              <p className="text-xs font-medium">30m</p>
            </div>
          </div>
          <hr className="mb-5" />
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-5">
              <img src="profile-cards/Ellipse 3.png" alt="" />
              <p className="font-bold">Ruth Stewart</p>
            </div>
            <p className="text-[6px] md:text-[16px] xl:text-[16px]">
              Nikmati kesegaran dan kelezatan dalam setiap mangkuk Sop Buah
              kami. Dibuat dari kombinasi buah-buahan segar seperti melon,
              semangka, anggur, dan pepaya, yang dipadu dengan sirup manis dan
              susu kental manis, Sop Buah ini adalah pilihan sempurna untuk
              menghilangkan dahaga dan memberikan sensasi segar di hari yang
              panas.
            </p>
            <hr className="mb-2 mt-5" />
            {/* BAHAN BAHAN */}
            <div>
              <p className="text-[10px] font-semibold md:text-[20px]">
                Bahan-bahan
              </p>
              <p className="text-[8px] md:text-[16px]">Untuk 1 Porsi</p>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  100 gram Melon
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  100 gram Semangka
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  100 gram Pepaya
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  100 gram Anggur
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  100 gram Nanas
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  1 pcs Apel
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  200 ml Sirup
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  200 ml Susu Kental Manis
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  500 ml Air Minum
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
              {/* LIST BAHAN */}
              <div className="mt-2 flex h-[24.87px] w-[177.12px] items-center justify-between rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[55px] md:w-[530px] xl:h-[55px] xl:w-[530px]">
                <p className="text-[8px] md:text-[16px] xl:text-[16px]">
                  Secukupnya, Es batu
                </p>
                <p className="text-[8px] font-medium text-red-500 md:text-[16px] xl:text-[16px]">
                  Cek Harga
                </p>
              </div>
            </div>
          </div>
          <hr className="mb-2 mt-5" />
          {/* INFORMASI NILAI GIZI */}
          <p className="mb-2 text-[10px] font-bold md:text-[20px] xl:text-[20px]">
            Informasi Nilai Gizi
          </p>
          <div className="flex h-[60px] w-[320px] flex-row items-center gap-5 rounded-[6px] border-[1px] border-slate-300 bg-[#FBFAF7] p-3 md:h-[107px] md:w-[650px] md:px-10 xl:h-[107px] xl:w-[784px] xl:px-10">
            <div className="mx-auto flex flex-row justify-around gap-2 md:gap-5 xl:gap-8">
              <div className="h-[30px] w-[45px] md:h-[41px] md:w-[75px] xl:h-[41px] xl:w-[85px]">
                <p className="text-center text-[8px] font-medium md:text-[14px] xl:text-[16px]">
                  Energi Total <br />
                  <span className="text-[8px] font-normal md:text-[14px] xl:text-[16px]">
                    219 Kkal
                  </span>
                </p>
              </div>
              <div>
                <p className="text-center text-[8px] font-medium md:text-[14px] xl:text-[16px]">
                  Lemak Total <br />
                  <span className="text-[8px] font-normal md:text-[16px] xl:text-[16px]">
                    10 g
                  </span>
                </p>
              </div>
              <div>
                <p className="text-center text-[8px] font-medium md:text-[16px] xl:text-[16px]">
                  Lemak Jenuh <br />
                  <span className="text-[8px] font-normal md:text-[16px] xl:text-[16px]">
                    4 g
                  </span>
                </p>
              </div>
              <div>
                <p className="text-center text-[8px] font-medium md:text-[16px] xl:text-[16px]">
                  Protein <br />
                  <span className="text-[8px] font-normal md:text-[16px] xl:text-[16px]">
                    7 g
                  </span>
                </p>
              </div>
              <div>
                <p className="text-center text-[8px] font-medium md:text-[16px] xl:text-[16px]">
                  Karbohidrat <br />
                  <span className="text-[8px] font-normal md:text-[16px] xl:text-[16px]">
                    10 g
                  </span>
                </p>
              </div>
              <div>
                <p className="text-center text-[8px] font-medium md:text-[16px] xl:text-[16px]">
                  Gula <br />
                  <span className="text-[8px] font-normal md:text-[16px] xl:text-[16px]">
                    23 g
                  </span>
                </p>
              </div>
              <div>
                <p className="text-center text-[8px] font-medium md:text-[16px] xl:text-[16px]">
                  Garam <br />
                  <span className="text-[8px] font-normal md:text-[16px] xl:text-[16px]">
                    2 mg
                  </span>
                </p>
              </div>
            </div>
          </div>
          <p className="mt-1 text-[7px] italic md:text-[10px]">
            *Nilai gizi yang ditampilkan merupakan perkiraan dan mungkin tidak
            sepenuhnya akurat.
          </p>
          <hr className="mb-2 mt-5" />
          <p className="mb-2 text-[10px] font-bold md:text-[20px] xl:text-[20px]">
            Langkah - langkah
          </p>
          <iframe
            className="h-[176.07px] w-[330px] md:h-[440px] md:w-[650px] xl:h-[440px] xl:w-[784px]"
            src="https://www.youtube.com/embed/Zbwr2aOpHrM"
            title="Resep Sop buah segar"
            allowFullScreen="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
          {/* LANGKA LANGKAH PAKE NOMOR */}
          {/* 1 */}
          <div className="mt-5 flex gap-3">
            <div className="rounded-full bg-black">
              <p className="h-[15px] w-[15px] text-center text-[6px] text-white md:h-[24px] md:w-[24px] md:text-[16px] xl:text-[16px]">
                1
              </p>
            </div>
            <p className="text-[8px] font-medium md:text-[16px] xl:text-[16px]">
              Cuci bersih semua buah-buahan.
            </p>
          </div>
          <img
            src="/resep/langkah1.png"
            alt=""
            className="ml-5 h-[80px] w-[80px] md:h-[166px] md:w-[166px]"
          />
          {/* 2 */}
          <div className="mt-5 flex gap-3">
            <div className="">
              <p className="h-[15px] w-[15px] rounded-full bg-black text-center text-[6px] text-white md:h-[24px] md:w-[24px] md:text-[16px] xl:text-[16px]">
                2
              </p>
            </div>
            <p className="text-[8px] font-medium md:text-[16px] xl:text-[16px]">
              Potong-potong semua buah sesuai ukuran yang diinginkan. Usahakan
              ukuran potongan buah seragam agar tampilannya menarik dan mudah
              disantap.
            </p>
          </div>
          <img
            src="/resep/2.svg"
            alt=""
            className="ml-5 h-[80px] w-[80px] md:h-[166px] md:w-[166px]"
          />
          {/* 3 */}
          <div className="mt-5 flex gap-3">
            <div>
              <p className="h-[15px] w-[15px] rounded-full bg-black text-center text-[6px] text-white md:h-[24px] md:w-[24px] md:text-[16px] xl:text-[16px]">
                3
              </p>
            </div>
            <p className="text-[8px] font-medium md:text-[16px] xl:text-[16px]">
              Campurkan air matang dengan sirup cocopandan dan susu kental manis
              dalam sebuah mangkuk besar. Aduk rata hingga tercampur sempurna.
            </p>
          </div>
          <img
            src="/resep/3.svg"
            alt=""
            className="ml-5 h-[80px] w-[80px] md:h-[166px] md:w-[166px]"
          />
          {/* 4 */}
          <div className="mt-5 flex gap-3">
            <div>
              <p className="h-[15px] w-[15px] rounded-full bg-black text-center text-[6px] text-white md:h-[24px] md:w-[24px] md:text-[16px] xl:text-[16px]">
                4
              </p>
            </div>
            <p className="text-[8px] font-medium md:text-[16px] xl:text-[16px]">
              Masukkan semua buah yang sudah dipotong ke dalam mangkuk berisi
              campuran kuah sirup dan susu.
            </p>
          </div>
          <img
            src="/resep/4.svg"
            alt=""
            className="ml-5 h-[80px] w-[80px] md:h-[166px] md:w-[166px]"
          />
          {/* 5 */}
          <div className="mt-5 flex gap-3">
            <div className="rounded-full bg-black">
              <p className="h-[15px] w-[15px] text-center text-[6px] text-white md:h-[24px] md:w-[24px] md:text-[16px] xl:text-[16px]">
                5
              </p>
            </div>
            <p className="text-[8px] font-medium md:text-[16px] xl:text-[16px]">
              Aduk perlahan agar buah tercampur rata dengan kuah.
            </p>
          </div>
          <img
            src="/resep/langkah1.png"
            alt=""
            className="ml-5 h-[80px] w-[80px] md:h-[166px] md:w-[166px]"
          />
        </div>
        {/* KANAN */}
        <div className="flex-none p-5">
          <p className="mb-2 text-[8px] font-semibold md:text-[16px] xl:text-[16px]">
            Resep Lainnya Untuk Kamu
          </p>
          <div className="grid grid-cols-2 xl:grid-cols-1">
            <Card
              image="/profile-cards/image 1.png"
              time="30m"
              likes="10k"
              tittle="Martabak Manis Cokelat Kacang Teflon"
              creatorName="Martin Joseph"
              creatorImage="/profile-cards/Ellipse 1.png"
            />
            <Card
              image="/profile-cards/image 1.png"
              time="30m"
              likes="10k"
              tittle="Martabak Manis Cokelat Kacang Teflon"
              creatorName="Martin Joseph"
              creatorImage="/profile-cards/Ellipse 1.png"
            />
            <Card
              image="/profile-cards/image 1.png"
              time="30m"
              likes="10k"
              tittle="Martabak Manis Cokelat Kacang Teflon"
              creatorName="Martin Joseph"
              creatorImage="/profile-cards/Ellipse 1.png"
            />
            <Card
              image="/profile-cards/image 1.png"
              time="30m"
              likes="10k"
              tittle="Martabak Manis Cokelat Kacang Teflon"
              creatorName="Martin Joseph"
              creatorImage="/profile-cards/Ellipse 1.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resep;
