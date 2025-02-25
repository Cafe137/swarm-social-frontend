import { Bee } from '@upcoming/bee-js'
import { useState } from 'react'
import { Board } from './Board'
import { Section } from './components/Section'

export function App() {
    const [bee, setBee] = useState<Bee | null>(null)
    const [url, setUrl] = useState('http://localhost:1633')

    function onProceed() {
        setBee(new Bee(url))
    }

    if (bee) {
        return <Board bee={bee} />
    }

    return (
        <Section title="Connect">
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} />
            <button onClick={onProceed}>Proceed</button>
        </Section>
    )
}
