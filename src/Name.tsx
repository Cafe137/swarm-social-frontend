import { EthAddress } from '@upcoming/bee-js'
import { Binary, Uint8ArrayReader } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { socReader } from './Bee'
import { NAME_HASH } from './Rules'

interface Props {
    owner: EthAddress
}

export function Name({ owner }: Props) {
    const [resolved, setResolved] = useState<string | null>(null)

    useEffect(() => {
        socReader
            .download(Binary.keccak256(Binary.concatBytes(owner.toUint8Array(), NAME_HASH)))
            .then(data => {
                const reader = new Uint8ArrayReader(data.payload.toUint8Array())
                const length = Binary.uint16ToNumber(reader.read(2), 'BE')
                const name = reader.read(length)
                setResolved(new TextDecoder().decode(name))
            })
            .catch(() => {})
    }, [])

    if (!resolved) {
        return <p>{owner.toHex()}</p>
    }

    return <p style={{ fontWeight: 'bold' }}>{resolved}</p>
}
