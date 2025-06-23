import type { ModuleInstance } from './main.js'
import { InstanceStatus } from '@companion-module/base'
import got from 'got'

interface jsonData {
	player: {
		activeItem: {
			columns: []
			duration: number
			index: number
			playlistId: string
			playlistIndex: number
			position: number
		}
		info: {
			name: string
			pluginVersion: string
			title: string
			version: string
		}
		options: [
			{
				enumNames: [
					'Default',
					'Repeat (playlist)',
					'Repeat (track)',
					'Random',
					'Shuffle (tracks)',
					'Shuffle (albums)',
					'Shuffle (folders)',
				]
				id: 'playbackOrder'
				name: 'Playback order'
				type: 'enum'
				value: number
			},
			{
				id: 'stopAfterCurrentTrack'
				name: 'Stop after current track'
				type: 'bool'
				value: boolean
			},
		]
		permissions: {
			changeClientConfig: boolean
			changeOutput: boolean
			changePlaylists: boolean
		}
		playbackMode: number
		playbackModes: [
			'Default',
			'Repeat (playlist)',
			'Repeat (track)',
			'Random',
			'Shuffle (tracks)',
			'Shuffle (albums)',
			'Shuffle (folders)',
		]
		playbackState: string
		volume: {
			isMuted: boolean
			max: number
			min: number
			type: string
			value: number
		}
	}
	playlistItems: {
		items: {
			columns: ['title']
		}[]
		offset: number
		totalCount: number
	}
	playlists: {
		id: string
		index: number
		isCurrent: boolean
		itemCount: number
		title: string
		totalTime: number
	}[]
}

function round(num: number, fractionDigits: number): number {
	return Number(num.toFixed(fractionDigits))
}

export async function UpdateVariables(self: ModuleInstance): Promise<void> {
	try {
		const res1 = await got.get(`http://${self.config.host}:${self.config.port}/api/query?player=true`)
		const json1 = JSON.parse(res1.body)
		let varsToUpdate = {}
		let updateFeedback: boolean = false
		// Update playbackState if necessary
		if (self.getVariableValue('playbackState') !== json1.player.playbackState) {
			varsToUpdate = {
				...varsToUpdate,
				playbackState: json1.player.playbackState,
			}
			updateFeedback = true
		}
		if (json1.player.activeItem.playlistId !== '') {
			const res2 = await got.get(
				`http://${self.config.host}:${self.config.port}/api/query?playlists=true&playlistItems=true&plref=${json1.player.activeItem.playlistId !== '' ? json1.player.activeItem.playlistId : 'p1'}&plrange=${json1.player.activeItem.index > 0 ? (json1.player.activeItem.index - 1).toString() + '%3A3' : '0%3A2'}&plcolumns=%25title%25`,
			)
			const json2 = JSON.parse(res2.body)
			const json: jsonData = {
				...json1,
				...json2,
			}
			let index: number
			let nextTrackName: string
			let previousTrackName: string
			if (json.player.activeItem.index > 0) {
				index = 1
				nextTrackName = json.playlistItems.items.length >= 3 ? json.playlistItems.items[2].columns[0] : ''
				previousTrackName = json.playlistItems.items[0].columns[0]
			} else {
				index = 0
				nextTrackName = json.playlistItems.items.length >= 2 ? json.playlistItems.items[1].columns[0] : '' // Debug
				previousTrackName = ''
			}
			// Update currentTrackName if necessary
			if (self.getVariableValue('currentTrackName') !== json.playlistItems.items[index].columns[0]) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackName: json.playlistItems.items[index].columns[0],
				}
			}
			// Update nextTrackName if necessary
			if (self.getVariableValue('nextTrackName') !== nextTrackName) {
				varsToUpdate = {
					...varsToUpdate,
					nextTrackName: nextTrackName,
				}
			}
			// Update previousTrackName if necessary
			if (self.getVariableValue('previousTrackName') !== previousTrackName) {
				varsToUpdate = {
					...varsToUpdate,
					previousTrackName: previousTrackName,
				}
			}
			// Update currentTrackDuration if necessary
			json.player.activeItem.duration = round(json.player.activeItem.duration, self.config.decimalPlaces)
			if (self.getVariableValue('currentTrackDuration') !== json.player.activeItem.duration) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackDuration: json.player.activeItem.duration,
				}
			}
			// Update currentTrackDuration if necessary
			json.player.activeItem.position = round(json.player.activeItem.position, self.config.decimalPlaces)
			if (self.getVariableValue('currentTrackPosition') !== json.player.activeItem.position) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackPosition: json.player.activeItem.position,
				}
			}
			// Update currentPlaylistName if necessary
			if (self.getVariableValue('currentPlaylistName') !== json.playlists[json.player.activeItem.playlistIndex].title) {
				varsToUpdate = {
					...varsToUpdate,
					currentPlaylistName: json.playlists[json.player.activeItem.playlistIndex].title,
				}
			}
		} else {
			if (
				self.getVariableValue('currentTrackName') !== '' ||
				self.getVariableValue('nextTrackName') !== '' ||
				self.getVariableValue('currentPlaylistName') !== '' ||
				self.getVariableValue('previousTrackName') !== ''
			) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackName: '',
					nextTrackName: '',
					currentPlaylistName: '',
					currentTrackDuration: 0,
					currentTrackPosition: 0,
					previousTrackName: '',
				}
			}
		}
		self.setVariableValues(varsToUpdate)
		if (updateFeedback) {
			self.checkFeedbacks()
		}
		self.updateStatus(InstanceStatus.Ok)
	} catch (e: any) {
		self.log('error', `HTTP POST Request failed (${e.message})`)
		self.updateStatus(InstanceStatus.UnknownError, e.code)
	}
}
