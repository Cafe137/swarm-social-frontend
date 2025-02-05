import { EthAddress, Reference } from '@upcoming/bee-js'
import { Binary, Uint8ArrayReader } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { socReader } from './Bee'
import { IMAGE_HASH } from './Rules'

interface Props {
    owner: EthAddress
}

export function Avatar({ owner }: Props) {
    const [resolved, setResolved] = useState<string | null>(null)

    useEffect(() => {
        socReader
            .download(Binary.keccak256(Binary.concatBytes(owner.toUint8Array(), IMAGE_HASH)))
            .then(data => {
                const reader = new Uint8ArrayReader(data.payload.toUint8Array())
                const reference = new Reference(reader.read(32))
                setResolved(reference.toHex())
            })
            .catch(() => {})
    }, [])

    if (!resolved) {
        return null
    }

    return <img className="avatar avatar-small" src={`http://localhost:1633/bzz/${resolved}/`} />
}
