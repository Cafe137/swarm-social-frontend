import { Bee } from '@upcoming/bee-js'
import { OWNER } from './Rules'

export const bee = new Bee('http://localhost:1633')
export const socReader = bee.makeSOCReader(OWNER)
