import { EthAddress } from '@upcoming/bee-js'
import { Dates } from 'cafe-utility'

export const WRITER = '0000000000000000000000000000000000000000000000000000000000001f16'
export const SERVER_OWNER = new EthAddress('da6ce1ebd4255dd02dae0c99256f0d3b4d61e513')

export function getCurrentIdentifierWord() {
    const currentDaySegment = Math.floor((Math.floor(Date.now() / 1000) % 86400) / 675)
    return `${Dates.isoDate()}/${currentDaySegment}`
}
