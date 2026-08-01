import data from "./addData.json";
import { api } from "./api";

const additionalInfo = async () => {
    if (!localStorage.getItem("additionalInfo")) {
        try {
            const [k, b] = await Promise.all([
                api.get("/category"),
                api.get("/ingredients"),
            ]);
            const additionalInfo = { kategori: k.category, bahan: b.ingredients };
            localStorage.setItem("additionalInfo", JSON.stringify(additionalInfo));
            return JSON.parse(localStorage.getItem("additionalInfo"));
        } catch {
            return data;
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
