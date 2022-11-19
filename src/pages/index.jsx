import { Route, Routes } from "react-router-dom";
import MainLayout from "../components/Layout";
import Home from "./Home";

export default function Router(){
    return (
    <Routes>
        <Route path="/" element={<MainLayout />} >
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
        </Route>
    </Routes>
    )
}