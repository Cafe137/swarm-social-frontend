import { BatchId, NULL_ADDRESS, PrivateKey } from '@upcoming/bee-js'
import { Binary } from 'cafe-utility'
import { bee } from '../Bee'
import { WRITER } from '../Consensus'

export async function publish(batchId: BatchId, identity: PrivateKey, tip: Uint8Array, text?: string, image?: File) {
    let textReference = new Uint8Array(32)
    let imageReference = new Uint8Array(32)

    if (text) {
        const result = await bee.uploadData(batchId, text)
        textReference = result.reference.toUint8Array()
    }

    if (image) {
        const result = await bee.uploadFile(batchId, image)
        imageReference = result.reference.toUint8Array()
    }

    const result = await bee.uploadData(batchId, Binary.concatBytes(textReference, imageReference))

    const pieces = Binary.concatBytes(
        identity.publicKey().address().toUint8Array(),
        tip,
        result.reference.toUint8Array()
    )
    const signature = identity.sign(pieces)

    await bee.gsocSend(batchId, WRITER, NULL_ADDRESS, Binary.concatBytes(signature.toUint8Array(), pieces))
}
