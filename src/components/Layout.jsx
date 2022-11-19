import {Layout} from "antd";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout(){
    return (
        <Layout>
            <Layout.Header style={{backgroundColor: "teal"}}>
                <Navbar />
            </Layout.Header>
            <Layout.Content style={{ padding: "20px 50px", minHeight: "80vh", }}>
                <Outlet />
            </Layout.Content>
            <Layout.Footer>
                <p>&copy;</p>
            </Layout.Footer>
        </Layout>
    )
}