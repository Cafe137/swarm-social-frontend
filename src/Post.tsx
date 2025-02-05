import { EthAddress, Reference } from '@upcoming/bee-js'
import { Binary, Uint8ArrayReader } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { Avatar } from './Avatar'
import { bee } from './Bee'
import { Name } from './Name'
import { Horizontal } from './utility/Horizontal'

interface Props {
    reference: Reference
}

export function Post({ reference }: Props) {
    const [owner, setOwner] = useState<Uint8Array | null>(null)
    const [content, setContent] = useState<string | null>(null)

    useEffect(() => {
        bee.downloadChunk(reference).then(chunk => {
            const reader = new Uint8ArrayReader(chunk)
            reader.read(65)
            const owner = reader.read(20)
            reader.read(32)
            reader.read(2)
            reader.read(2)
            const hasImage = reader.read(1)[0] === 1
            const image = hasImage ? reader.read(32) : null
            const length = Binary.uint16ToNumber(reader.read(2), 'BE')
            const text = new TextDecoder().decode(reader.read(length))
            setContent(text)
            setOwner(owner)
        })
    }, [])

    if (!content) {
        return <p>Loading...</p>
    }

    const ethAddress = owner ? new EthAddress(owner) : null

    return (
        <div>
            {ethAddress && (
                <Horizontal gap={8}>
                    <Avatar owner={ethAddress} />
                    <Name owner={ethAddress} />
                </Horizontal>
            )}
            <div className="post-body">
                <p>{content}</p>
            </div>
        </div>
    )
}
