//import { getUserAccount } from '@decentraland/EthereumController'
//import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { getUserData } from '@decentraland/Identity'

export let userName: string

export async function getUserInfo() {
  //const realm = await getCurrentRealm().then((r: any) => r.domain)
  let userData = await getUserData()
  userName = userData.displayName
  log(
    `https://peer.decentraland.org/content/entities/profiles?pointer=${userData.userId.toLowerCase()}`
  )
  return (await fetch(
    `https://peer.decentraland.org/content/entities/profiles?pointer=${userData.userId.toLowerCase()}`
  )
    .then((res) => res.json())
    .then((res) => (res.length ? res[0] : res))) as Profiles
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
