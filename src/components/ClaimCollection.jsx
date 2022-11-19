import { Button, Form, Input, message, Modal, Space} from "antd";
import { BigNumber } from "ethers";
import { keccak256, toUtf8Bytes} from "ethers/lib/utils";
import { useState } from "react";
import { useSigner } from "wagmi";
import { claimToken } from "../service/contractService";

function ClaimTokenForm({collectionIndex = 0}) {
    const [loading, setLoading] = useState(false);
    const {data: signer} = useSigner();

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            const { code } = values;
            
            console.log( keccak256(toUtf8Bytes(code)).length);

            await claimToken(signer, {index: BigNumber.from(collectionIndex) , code: keccak256(toUtf8Bytes(code))});

            message.success("Completed successfully")
        } catch (error) {
            message.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form 
            disabled={loading} 
            onFinish={handleFinish}
            >
            
            <Form.Item
                label="Mint Code"
                name="code"
                rules={[{ required: true, message: 'Please input minting code' }]}

            >
                <Input.Password />
            </Form.Item>
            
            <Form.Item>
                <Space>
                    <Button htmlType="reset">Reset</Button>
                    <Button type="primary" htmlType="submit">Claim</Button>
                </Space>
            </Form.Item>
        </Form>
    )
}

export default function ClaimToken({collectionIndex}) {
    const [openModal, setOpenModal] = useState(false);

    const showModal = () => {
        setOpenModal(true);
    };

    const handleCancel = () => {
        setOpenModal(false);
    };

    return (
        <>
            <Modal
                title={"Claim Token"}
                open={openModal}
                onCancel={handleCancel}
                footer={null}
            >
                <ClaimTokenForm collectionIndex={collectionIndex}/>
            </Modal>
            <Button type="text" style={{ color: "inherit", height: "100%", padding: "0 20px" }} block onClick={showModal}>Claim NFT</Button>
        </>
    )
}