import { Tabs, Card, Col, Divider, Empty, Row, Space, Statistic, Tag } from "antd";
import { useState } from "react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import ClaimToken from "../../components/ClaimCollection";
import { getCollections,getMintedCollections } from "../../service/contractService";

export default function Home() {
    const [collections, setCollection] = useState();
    const [nfts, setNfts] = useState();
    const { address } = useAccount();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const collection = await getCollections(address);

                console.log(collection);

                setCollection(collection);

            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        })()
    }, [address]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const nfts = await getMintedCollections(address);

                setNfts(nfts);

            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        })()
    }, [address])

    if (loading) {
        return "Loading ..."
    }
    return (
        <Tabs defaultActiveKey="1" tabPosition="left">
            <Tabs.TabPane tab="Created Collections" key="1">
                <Row>
                    <Col span={24}>
                        <h1>Collections</h1>

                        <Space align="top">
                            {collections?.length > 0 ? collections?.map(({ name, expires, maxMint, image, collectionIndex, minted }, idx) =>

                            (
                                <Col span={{ xs: 24, sm: 6, md: 4 }}>
                                    <Card
                                        hoverable
                                        style={{ width: 240 }}
                                        cover={<img alt={name} src={`https://ipfs.io/ipfs/${image.split("//")[1]}`} />}
                                        actions={[
                                            <ClaimToken collectionIndex={collectionIndex.toString()} />
                                        ]}
                                    >

                                        <Card.Meta title={name} />
                                        <Divider />
                                        <Row gutter={16}>
                                            <Col >
                                                <Statistic title="Claimed" value={minted} suffix={`/ ${maxMint}`} />
                                            </Col>
                                            <Col Span={24}>
                                                <Statistic.Countdown title="Expires In" value={expires} />
                                            </Col>
                                        </Row>
                                    </Card></Col>)
                            ) : <Empty />}
                        </Space>
                    </Col>
                </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Claimed NFTs" key="2">
            <Row>
                    <Col span={24}>
                        <h1>Collections</h1>

                        <Space align="top">
                            {nfts?.length > 0 ? nfts?.map(({ name, attributes, image }, idx) =>

                            (
                                <Col span={{ xs: 24, sm: 6, md: 4 }}>
                                    <Card
                                        hoverable
                                        style={{ width: 240 }}
                                        cover={<img alt={name} src={`https://ipfs.io/ipfs/${image.split("//")[1]}`} />}
                                    >

                                        <Card.Meta title={name} />
                                        <Divider />
                                        <p>Properties: </p>
                                        <Row gutter={16}>
                                            {
                                                attributes?.map(({trait_type, value} )=> <Tag><b>{trait_type}</b> - {value}</Tag> )
                                            }
                                        </Row>
                                    </Card></Col>)
                            ) : <Empty />}
                        </Space>
                    </Col>
                </Row>
            </Tabs.TabPane>
           
        </Tabs>

    )
}