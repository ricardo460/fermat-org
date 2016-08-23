/// <reference path="../../common/helper.d.ts" />
/// <reference path="../../common/cli.d.ts" />
/// <reference path="../../common/constants.d.ts" />
/// <reference path="../../common/TrackballControls.d.ts" />
/// <reference path="../../common/hash.d.ts" />
/// <reference path="../../common/vis.d.ts" />

interface Position2D {
	x: number,
	y: number
}

interface Position3D extends Position2D {
	z: number
}

interface Rectangle extends Position2D {
	h: number,
	w: number
}

interface TileElementData extends Rectangle {
	minQuality?: string,
	color?: string,
	font?: string,
	constraint?: number,
	lineHeight?: number,
	src?: string,
	skip?: boolean,
	text?: string,
	wrap?: boolean
}

interface bUserData {
    usrnm: string,
    name: string,
    email: string,
    avatar_url: string
}

interface UserData extends bUserData {
    __v: string
    _id: string,
    axs_key: string,
    github_tkn: string
}

interface AuthorData extends bUserData {
    role: string,
    scope: string,
    percnt: number
}

interface CookieData {
    _id: string,
    axs_key: string,
    upd_at: string,
    userData: UserData
}

interface DeveloperData {
    id: string,
    author: string,
    picture: string,
    authorRealName: string,
    authorEmail: string
}

interface TableDimensions {
    columnWidth: number,
    superLayerMaxHeight: number,
    groupsQtty: number,
    layersQtty: number,
    superLayerPosition: any[],
	layerPositions: any[]
}

interface TileData {
	global: {
		portrait: TileElementData,
		groupIcon: TileElementData,
		typeIcon: TileElementData,
        ring: TileElementData,
		codeText: TileElementData,
		nameText: TileElementData,
		layerText: TileElementData,
		authorText: TileElementData,
		maintainer: TileElementData,
		nameMaintainer: TileElementData,
		userMaintainer: TileElementData
	},
	concept: {
		pic: TileElementData,
		groupIcon: TileElementData,
		typeIcon: TileElementData,
		ring: TileElementData,
		codeText: TileElementData,
		nameText: TileElementData,
		layerText: TileElementData,
		authorText: TileElementData,
		picMaintainer: TileElementData,
		maintainer: TileElementData,
		nameMaintainer: TileElementData,
		userMaintainer: TileElementData
	},
	development: {
		pic: TileElementData,
		groupIcon: TileElementData,
		typeIcon: TileElementData,
		ring: TileElementData,
		codeText: TileElementData,
		nameText: TileElementData,
		layerText: TileElementData,
		authorText: TileElementData,
		picMaintainer: TileElementData,
		maintainer: TileElementData,
		nameMaintainer: TileElementData,
		userMaintainer: TileElementData
	},
	qa: {
		pic: TileElementData,
		groupIcon: TileElementData,
		typeIcon: TileElementData,
		ring: TileElementData,
		codeText: TileElementData,
		nameText: TileElementData,
		layerText: TileElementData,
		authorText: TileElementData,
		picMaintainer: TileElementData,
		maintainer: TileElementData,
		nameMaintainer: TileElementData,
		userMaintainer: TileElementData
	},
	production: {
		pic: TileElementData,
		groupIcon: TileElementData,
		typeIcon: TileElementData,
		ring: TileElementData,
		codeText: TileElementData,
		nameText: TileElementData,
		layerText: TileElementData,
		authorText: TileElementData,
		picMaintainer: TileElementData,
		maintainer: TileElementData,
		nameMaintainer: TileElementData,
		userMaintainer: TileElementData
	},
	qualities: {
		mini: number,
		small: number,
		medium: number,
		high: number
	}
}

interface MapView {
	enabled: boolean,
	title: string
}

interface Map {
	start: string,
	views: {
		[index: string]: MapView
	}	
}