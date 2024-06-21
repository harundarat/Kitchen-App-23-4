import axios from "axios";
import data from "./addData.json"

const additionalInfo = async () => {
    if (!localStorage.getItem("additionalInfo")) {
        try {
            const k = await axios.get("/category");
            const b = await axios.get("/ingredients");
            const additionalInfo = { kategori: k.data.category, bahan: b.data.ingredients };
            localStorage.setItem("additionalInfo", JSON.stringify(additionalInfo));
            return JSON.parse(localStorage.getItem("additionalInfo"));
        } catch (error) {
            return data;
            throw error;
        }
    } else {
        const addInfo = JSON.parse(localStorage.getItem("additionalInfo"));
        const hasBahan = 'bahan' in addInfo;
        const hasKategori = 'kategori' in addInfo;

        const isBahanEmpty = hasBahan && data.bahan.length === 0;
        const isKategoriEmpty = hasKategori && data.kategori.length === 0;

        if (!hasBahan && !hasKategori) {
            localStorage.removeItem("additionalInfo");
            return data;
        }

        if (isBahanEmpty && isKategoriEmpty) {
            localStorage.removeItem("additionalInfo");
            return data;
        }
        return JSON.parse(localStorage.getItem("additionalInfo"));
    }
}

export { additionalInfo };