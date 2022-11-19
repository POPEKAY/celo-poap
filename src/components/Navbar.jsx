import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu } from "antd";
import ClaimToken from "./ClaimCollection";
import CreateCollection from "./CreateCollection";

export default function Navbar() {
    return (
        <div style={{ display: "flex", alignItems: "center", backgroundColor: "transparent" }}>

            <div className="logo" />
            <Menu
                style={{backgroundColor: "transparent"}}
                theme="dark"
                mode="horizontal"
            >
                <Menu.Item>Dashboard</Menu.Item>
                <Menu.Item style={{ padding: 0 }} selectable={false}>
                    <CreateCollection />
                </Menu.Item>
                <Menu.Item style={{ padding: 0 }} selectable={false}>
                    <ClaimToken />
                </Menu.Item>

            </Menu>
            <div style={{ flex: 1, justifyContent: "end", display: "flex" }}>
                <ConnectButton />
            </div>
        </div>
    )
}