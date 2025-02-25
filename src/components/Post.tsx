import { Bee, EthAddress, Reference } from '@upcoming/bee-js'
import { Binary, Uint8ArrayReader } from 'cafe-utility'
import { useEffect, useState } from 'react'

interface Props {
    bee: Bee
    reference: Reference
}

export function Post({ bee, reference }: Props) {
    const [digest, setDigest] = useState<string | null>(null)
    const [signature, setSignature] = useState<string | null>(null)
    const [previous, setPrevious] = useState<string | null>(null)
    const [payloadReference, setPayloadReference] = useState<string | null>(null)
    const [owner, setOwner] = useState<EthAddress | null>(null)
    const [text, setText] = useState<string | null>(null)
    const [image, setImage] = useState<string | null>(null)
    const [showProof, setShowProof] = useState<boolean>(false)

    useEffect(() => {
        async function initialize() {
            const result = await bee.downloadData(reference)
            setDigest(Binary.uint8ArrayToHex(result.toUint8Array().slice(65)))
            const reader = new Uint8ArrayReader(result.toUint8Array())
            setSignature(Binary.uint8ArrayToHex(reader.read(65)))
            const owner = new EthAddress(reader.read(20))
            setPrevious(Binary.uint8ArrayToHex(reader.read(32)))
            setOwner(owner)
            const payloadReference = reader.read(32)
            setPayloadReference(Binary.uint8ArrayToHex(payloadReference))
            const payload = await bee.downloadData(payloadReference)
            const textReference = payload.toUint8Array().slice(0, 32)
            const imageReference = payload.toUint8Array().slice(32, 64)
            if (textReference && !Binary.equals(textReference, new Uint8Array(32))) {
                const textPayload = await bee.downloadData(textReference)
                setText(textPayload.toUtf8())
            }
            if (imageReference && !Binary.equals(imageReference, new Uint8Array(32))) {
                setImage(`http://localhost:1633/bzz/${Binary.uint8ArrayToHex(imageReference)}/`)
            }
        }

        initialize()
    }, [reference])

    if (owner) {
        return (
            <div className="post">
                <p>
                    <strong>{owner.toHex().slice(0, 12)}</strong>
                </p>
                {text && <p>{text}</p>}
                {image && <img src={image} />}
                <p className="proof-button" onClick={() => setShowProof(x => !x)}>
                    Proof {showProof ? '▲' : '▼'}
                </p>
                {showProof && (
                    <div className="proof">
                        <p>Reference: {reference.toHex()}</p>
                        <p>Previous reference: {previous}</p>
                        <p>Owner: {owner.toHex()}</p>
                        <p>Signature: {signature}</p>
                        <p>Payload reference: {payloadReference}</p>
                        <p>Digest: {digest}</p>
                    </div>
                )}
            </div>
        )
    }
}
