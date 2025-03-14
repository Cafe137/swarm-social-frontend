import { BatchId, Bee, PrivateKey, Reference, Topic } from '@upcoming/bee-js'
import { Binary, Dates, Strings, System } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { Post } from './components/Post'
import { getCurrentIdentifierWord, SERVER_OWNER } from './Consensus'
import { publish } from './service/Publisher'

interface Props {
    bee: Bee
}

export function Board({ bee }: Props) {
    const [newPostText, setNewPostText] = useState<string>('')
    const [newPostImage, setNewPostImage] = useState<File | null>(null)
    const [posts, setPosts] = useState<Reference[]>([])
    const [batchId, setBatchId] = useState<BatchId | null>(null)
    const [possibleBatchIds, setPossibleBatchIds] = useState<BatchId[]>([])
    const [resetCounter, setResetCounter] = useState(0)

    const identity = new PrivateKey(localStorage.getItem('identity') || Strings.randomHex(64))

    if (identity && !localStorage.getItem('identity')) {
        localStorage.setItem('identity', identity.toHex())
    }

    useEffect(() => {
        async function initialize() {
            const batches = await bee.getAllPostageBatch()
            setPossibleBatchIds(batches.map(x => x.batchID))
        }

        initialize()
    }, [])

    useEffect(() => {
        async function initialize() {
            const feedReader = bee.makeFeedReader(Topic.fromString(getCurrentIdentifierWord()), SERVER_OWNER)
            const result = await feedReader.download()
            setPosts(Binary.partition(result.payload.toUint8Array(), 32).map(x => new Reference(x)))
        }

        return System.runAndSetInterval(initialize, Dates.seconds(10))
    }, [])

    async function handleSubmit() {
        if (!batchId) {
            alert('Please select a batch ID')
            return
        }

        if (!posts[0]) {
            return
        }

        if (!newPostText && !newPostImage) {
            alert('Please write a post or upload an image')
            return
        }

        try {
            await publish(bee, batchId, identity, posts[0].toUint8Array(), newPostText, newPostImage ?? undefined)

            alert('Your post will be visible in the feed shortly')

            setNewPostText('')
            setNewPostImage(null)
            setBatchId(null)
            setResetCounter(x => x + 1)
        } catch {
            alert('Failed to publish the post, check console for more details')
        }
    }

    return (
        <>
            <section>
                <h2>Identity</h2>
                <div className="section-body">
                    <p>{identity.publicKey().address().toHex()}</p>
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
                        key={`image-${resetCounter}`}
                        className="borderless"
                        type="file"
                        accept="image/*"
                        onChange={e => setNewPostImage(e.target.files ? e.target.files[0] : null)}
                    />
                    <select key={`select-${resetCounter}`} onChange={e => setBatchId(new BatchId(e.target.value))}>
                        <option value="">Select Batch ID</option>
                        {possibleBatchIds.map(id => (
                            <option key={id.toHex()} value={id.toHex()}>
                                {id.toHex()}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            </section>
            <section>
                <h2>Feed</h2>
                <div className="section-body">
                    {posts
                        .filter(x => x.toHex() !== '00'.repeat(32))
                        .map(post => (
                            <Post key={post.toHex()} bee={bee} reference={post} />
                        ))}
                </div>
            </section>
        </>
    )
}
