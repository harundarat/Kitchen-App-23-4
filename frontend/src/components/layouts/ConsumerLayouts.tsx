import { Outlet } from "react-router-dom";
import { AdditionalInfoProvider } from "../../context/additionalInfoContext";
import Footer from "./Footer";
import Navbar from "./Navbar";

export function ConsumerLayout() {
  return (
    <AdditionalInfoProvider>
      <Navbar />
      <Outlet />
      <Footer />
    </AdditionalInfoProvider>
  );
}

export function ConsumerEditorLayout() {
  return (
    <AdditionalInfoProvider>
      <Outlet />
    </AdditionalInfoProvider>
  );
}
