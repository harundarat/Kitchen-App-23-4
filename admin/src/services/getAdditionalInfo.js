import axios from "axios";
import data from "./addData.json"

const additionalInfo = async () => {
    if (!localStorage.getItem("additionalInfo")) {
        try {
            const k = await axios.get("/kategori");
            const b = await axios.get("/bahan");
            const additionalInfo = { kategori: k.data.category, bahan: b.data.ingredients };
            localStorage.setItem("additionalInfo", JSON.stringify(additionalInfo));
            return JSON.parse(localStorage.getItem("additionalInfo"));
        } catch (error) {
            return data;
            throw error;
        }
    } else {
        return JSON.parse(localStorage.getItem("additionalInfo"));
    }
}

export { additionalInfo };