import { Button, DatePicker, Divider, Form, Input, message, Modal, Space, Upload } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"
import { useState } from "react";
import { NFTStorage, File } from "nft.storage";
import { createACollection } from "../service/contractService";
import { useSigner } from "wagmi";
import { BigNumber } from "ethers";

function CreateCollectionForm() {
    const [loading, setLoading] = useState(false);
    const { data: signer } = useSigner();
    const [form] = Form.useForm();

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            const { code, description, properties, expires, image, maxMint, title } = values;

            const attributes = properties?.reduce((accum, cur, idx) => ([...accum, { trait_type: cur.attribute, value: cur.value }]), []);

            // create a new NFTStorage client using our API key
            const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_KEY })

            const {url: uri} = await nftstorage.store({
                name: title,
                image: image.file.originFileObj,
                description,
                expires: expires.valueOf(),
                maxMint,
                attributes
            }); 

            await createACollection(signer, {code, maxMint, secondsToExpire: BigNumber.from(expires.valueOf()), uri });

            message.success("Completed successfully");
            form.resetFields();
        } catch (error) {
            message.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form disabled={loading} onFinish={handleFinish} form={form}>
            <Form.Item
                name="title"
                label="Title"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item label="Image" name="image" rules={[
                {
                    required: true,
                },
            ]}>
                <Upload showUploadList={false} accept=".jpeg,.jpg,.png,.gif">
                    <Button >Select Image</Button>
                </Upload>
            </Form.Item>
            <Form.Item label="Maximum Mint" name="maxMint" rules={[
                {
                    required: true,
                },
            ]}>
                <Input type="number" min={0} />
            </Form.Item>
            <Form.Item
                label="Mint Code"
                name="code"
                rules={[{ required: true, message: 'Please input minting code' }]}

            >
                <Input.Password />
            </Form.Item>
            <Form.Item label="Code Expires" name="expires" rules={[
                {
                    required: true,
                },
            ]}>
                <DatePicker />
            </Form.Item>
            <Form.Item label="Description" name="description">
                <Input.TextArea rows={4} />
            </Form.Item>
            <Divider >NFT Properties</Divider>
            <Form.List name="properties">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((field, idx) => (
                            <Space key={idx} align="baseline">
                                <Form.Item
                                    shouldUpdate={(prevValues, curValues) =>
                                        prevValues.area !== curValues.area || prevValues.sights !== curValues.sights
                                    }
                                    {...field}
                                    label="Attribute"
                                    name={[field.name, 'attribute']}
                                    rules={[{ required: true, message: 'Missing attribute' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    {...field}
                                    label="Value"
                                    name={[field.name, 'value']}
                                    rules={[{ required: true, message: 'Missing attribute value' }]}
                                >
                                    <Input />
                                </Form.Item>

                                <MinusCircleOutlined onClick={() => remove(field.name)} />
                            </Space>
                        ))}

                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add Property
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Form.Item>
                <Space>
                    <Button htmlType="reset">Reset</Button>
                    <Button type="primary" htmlType="submit">Create</Button>
                </Space>
            </Form.Item>
        </Form>
    )
}

export default function CreateCollection() {
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
                title={"Create Collection"}
                open={openModal}
                onCancel={handleCancel}
                footer={null}
            >
                <CreateCollectionForm />
            </Modal>
            <Button type="text" style={{ color: "inherit", height: "100%", padding: "0 20px" }} block onClick={showModal}>Create</Button>
        </>
    )
}