import { ReactNode } from 'react'

interface Props {
    title: string
    children: ReactNode
}

export function Section({ title, children }: Props) {
    return (
        <section>
            <h2>{title}</h2>
            <div className="section-body">{children}</div>
        </section>
    )
}
