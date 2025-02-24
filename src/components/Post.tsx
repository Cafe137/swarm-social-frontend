import { EthAddress, Reference } from '@upcoming/bee-js'
import { Binary, Uint8ArrayReader } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { bee } from '../Bee'

interface Props {
    reference: Reference
}

export function Post({ reference }: Props) {
    const [owner, setOwner] = useState<EthAddress | null>(null)
    const [text, setText] = useState<string | null>(null)
    const [image, setImage] = useState<string | null>(null)

    useEffect(() => {
        async function initialize() {
            const result = await bee.downloadData(reference)
            const reader = new Uint8ArrayReader(result.toUint8Array())
            reader.read(65) // skip signature
            const owner = new EthAddress(reader.read(20))
            reader.read(32) // skip tip
            setOwner(owner)
            const payloadReference = reader.read(32)
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
            </div>
        )
    }
}
