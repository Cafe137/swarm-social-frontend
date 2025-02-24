interface Props {
    children: React.ReactNode
    gap?: number
}

export function Horizontal({ children, gap = 16 }: Props) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: `${gap}px`,
                alignItems: 'center'
            }}
        >
            {children}
        </div>
    )
}
