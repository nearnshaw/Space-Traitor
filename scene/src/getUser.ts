//import { getUserAccount } from '@decentraland/EthereumController'
//import { getCurrentRealm } from '@decentraland/EnvironmentAPI'

import { getCurrentRealm, isPreviewMode } from '@decentraland/EnvironmentAPI'
import { setUserData, userData } from './connection'

export async function getUserInfo() {
  //const realm = await getCurrentRealm().then((r: any) => r.domain)
  if (!userData) {
    await setUserData()
  }
  const isPreview = await isPreviewMode()
  const realm = await getCurrentRealm()
  let dataURL =
    realm.domain +
    '/lambdas/profiles?field=snapshot&id=' +
    userData.userId.toLowerCase()
  log('FETCHING THUMB FROM ', dataURL)
  // log(
  //   `https://peer.decentraland.org/content/entities/profiles?pointer=${userData.userId.toLowerCase()}`
  // )

  if (isPreview) {
    return {
      face128:
        'https://peer.decentraland.org/content/contents/QmcHi6q7N6Ltse4YgFv2WPTMDpKCup3SQAUgQJ2Tjxkitg',
    }
  }

  return (await fetch(dataURL)
    .then((res) => {
      try {
        return res.json()
      } catch {
        return null
      }
    })
    .then((res) =>
      res && res.length && res[0].avatars
        ? res[0].avatars[0].avatar.snapshots
        : null
    )) as Snapshots
}

export interface Profiles {
  id: string
  type: string
  timestamp: number
  pointers: string[]
  content: any[]
  metadata: Metadata
}

export interface Metadata {
  avatars: AvatarElement[]
}

export interface AvatarElement {
  userId: string
  email: string
  name: string
  hasClaimedName: boolean
  description: string
  ethAddress: string
  version: number
  avatar: AvatarAvatar
  inventory: string[]
  blocked: string[]
  tutorialStep: number
}

export interface AvatarAvatar {
  bodyShape: string
  snapshots: Snapshots
  eyes: Eyes
  hair: Eyes
  skin: Eyes
  wearables: string[]
  version: number
}

export interface Eyes {
  color: EyesColor
}

export interface EyesColor {
  color: ColorColor
}

export interface ColorColor {
  r: number
  g: number
  b: number
  a: number
}

export interface Snapshots {
  face: string
  face128: string
  face256: string
  body: string
}
