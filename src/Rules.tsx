import { Binary } from 'cafe-utility'

export const GSOC_WRITER = '0000000000000000000000000000000000000000000000000000000000001f16'

export const OWNER = 'a7b88a0ecfb6caa5449be3958b2788c740e21dd1'

export const NAME_HASH = Binary.hexToUint8Array('504994e44425e1db847ab0018cb7119530414d079d0425ddf6d616a943d3a8d5')
export const IMAGE_HASH = Binary.hexToUint8Array('24d002e5c5cbab0b49839fc7e507ac5ca5935e8452b844a8b1b53d1b071d4479')

export const TIP_IDENTIFIER = Binary.hexToUint8Array('dec0f8abc841d202f242ebf50880874a8918fe0ff936097ab83e47943928b2bf')
export const POST_IDENTIFIER = Binary.hexToUint8Array(
    '3572a52f4913d03452e650c6919cd653fa7727cb6d9a0c63efb9e556d0201ab8'
)

export const ACTION_SET_NAME = 1
export const ACTION_SET_IMAGE = 2
export const ACTION_POST = 3
