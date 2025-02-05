import { NULL_ADDRESS, PrivateKey, Reference } from '@upcoming/bee-js'
import { Binary, Strings, Uint8ArrayReader } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { bee, socReader } from './Bee'
import { Name } from './Name'
import { Post } from './Post'
import {
    ACTION_POST,
    ACTION_SET_IMAGE,
    ACTION_SET_NAME,
    GSOC_WRITER,
    IMAGE_HASH,
    POST_IDENTIFIER,
    TIP_IDENTIFIER
} from './Rules'
import { Horizontal } from './utility/Horizontal'

const STAMP = 'ecd7eb266cdaeba3f04e886522fee03826c6551fba346b8673326fa8a03a9ce4'

export function App() {
    const [tip, setTip] = useState<Uint8Array | null>(null)
    const [image, setImage] = useState<string | null>(null)

    const [newPostText, setNewPostText] = useState<string>('')
    const [newPostImage, setNewPostImage] = useState<string>('')

    const [posts, setPosts] = useState<Uint8Array[]>([])

    const signer = new PrivateKey(localStorage.getItem('signer') || Strings.randomHex(64))

    if (signer && !localStorage.getItem('signer')) {
        localStorage.setItem('signer', signer.toHex())
    }

    useEffect(() => {
        socReader
            .download(TIP_IDENTIFIER)
            .then(data => {
                setTip(data.payload.toUint8Array())
            })
            .catch(() => {
                setTip(new Uint8Array(32))
            })
        socReader
            .download(POST_IDENTIFIER)
            .then(data => {
                const chunks = Binary.partition(data.payload.toUint8Array(), 32)
                setPosts(chunks)
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        socReader
            .download(Binary.keccak256(Binary.concatBytes(signer.publicKey().address().toUint8Array(), IMAGE_HASH)))
            .then(data => {
                const reader = new Uint8ArrayReader(data.payload.toUint8Array())
                const reference = new Reference(reader.read(32))
                setImage(reference.toHex())
            })
            .catch(() => {})
    }, [signer])

    async function assignImage() {
        const image = prompt('Enter the hash of your image')
        if (!image) {
            return
        }
        if (!tip) {
            return
        }
        const pieces = [
            signer.publicKey().address().toUint8Array(),
            tip,
            Binary.numberToUint16(ACTION_SET_IMAGE, 'BE'),
            Binary.numberToUint16(32, 'BE'),
            new Reference(image).toUint8Array()
        ]
        const signature = signer.sign(Binary.concatBytes(...pieces))
        await bee.gsocSend(
            STAMP,
            GSOC_WRITER,
            NULL_ADDRESS,
            Binary.concatBytes(...[signature.toUint8Array(), ...pieces])
        )
        location.reload()
    }

    async function assignName() {
        const name = prompt('Enter your name')
        if (!name) {
            return
        }
        if (!tip) {
            return
        }
        const pieces = [
            signer.publicKey().address().toUint8Array(),
            tip,
            Binary.numberToUint16(ACTION_SET_NAME, 'BE'),
            Binary.numberToUint16(name.length + 2, 'BE'),
            Binary.numberToUint16(name.length, 'BE'),
            new TextEncoder().encode(name)
        ]
        const signature = signer.sign(Binary.concatBytes(...pieces))
        await bee.gsocSend(
            STAMP,
            GSOC_WRITER,
            NULL_ADDRESS,
            Binary.concatBytes(...[signature.toUint8Array(), ...pieces])
        )
        location.reload()
    }

    async function handleSubmit() {
        if (!tip) {
            return
        }
        const hasImageByte = newPostImage ? 1 : 0
        const pieces = [
            signer.publicKey().address().toUint8Array(),
            tip,
            Binary.numberToUint16(ACTION_POST, 'BE'),
            Binary.numberToUint16(newPostText.length + 3 + (hasImageByte ? 32 : 0), 'BE'),
            new Uint8Array([hasImageByte]),
            hasImageByte ? new Reference(newPostImage).toUint8Array() : new Uint8Array(0),
            Binary.numberToUint16(newPostText.length, 'BE'),
            new TextEncoder().encode(newPostText)
        ].filter(x => x.length)
        if (newPostImage) {
            pieces.push(new Reference(newPostImage).toUint8Array())
        }
        const signature = signer.sign(Binary.concatBytes(...pieces))
        await bee.gsocSend(
            STAMP,
            GSOC_WRITER,
            NULL_ADDRESS,
            Binary.concatBytes(...[signature.toUint8Array(), ...pieces])
        )
        location.reload()
    }

    return (
        <>
            <section>
                <h2>Identity</h2>
                <div className="section-body vertical-center">
                    {image ? (
                        <img
                            onClick={assignImage}
                            className="avatar hoverable"
                            src={`http://localhost:1633/bzz/${image}/`}
                        />
                    ) : (
                        <button onClick={assignImage}>Set image</button>
                    )}
                    <Horizontal>
                        <Name owner={signer.publicKey().address()} />
                        <button onClick={assignName}>Modify name</button>
                    </Horizontal>
                </div>
            </section>
            <section>
                <h2>Post</h2>
                <div className="section-body">
                    <textarea
                        placeholder="Write your post here"
                        value={newPostText}
                        onChange={e => setNewPostText(e.target.value)}
                    />
                    <input
                        placeholder="Image reference"
                        value={newPostImage}
                        onChange={e => setNewPostImage(e.target.value)}
                    />
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            </section>
            <section>
                <h2>Feed</h2>
                <div className="section-body">
                    {posts.map((post, index) => (
                        <Post key={index} reference={new Reference(post)} />
                    ))}
                </div>
            </section>
        </>
    )
}
