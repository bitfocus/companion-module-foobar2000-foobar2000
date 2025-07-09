import type { ModuleInstance } from './main.js'
import { InstanceStatus } from '@companion-module/base'
import got from 'got'

interface jsonData {
	player: {
		activeItem: {
			columns: string[]
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
			columns: string[]
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

export function formatSecondsToMinSec(seconds: number): string {
	const mins = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

export async function UpdateVariables(self: ModuleInstance): Promise<void> {
	try {
		const playerUrl = `http://${self.config.host}:${self.config.port}/api/query?player=true&trcolumns=%25artist%25,%25album%25,%25title%25`;
self.log('info', `[API] Requesting player info: ${playerUrl}`);
let res1;
try {
	res1 = await got.get(playerUrl);
} catch (err) {
	if (err instanceof Error) {
		self.log('error', `Player request failed: ${playerUrl} | ${err.message}`);
	} else {
		self.log('error', `Player request failed: ${playerUrl} | ${JSON.stringify(err)}`);
	}
	throw err;
}
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
			const playlistUrl = `http://${self.config.host}:${self.config.port}/api/query?playlistItems=true&plref=${encodeURIComponent(json1.player.activeItem.playlistId !== '' ? json1.player.activeItem.playlistId : 'p1')}&plrange=${json1.player.activeItem.index > 0 ? encodeURIComponent((json1.player.activeItem.index - 1).toString() + ':3') : encodeURIComponent('0:2')}&plcolumns=%25artist%25,%25album%25,%25title%25`;
self.log('info', `[API] Requesting playlistItems: ${playlistUrl}`);
let res2;
try {
	res2 = await got.get(playlistUrl);
} catch (err) {
	if (err instanceof Error) {
		self.log('error', `Playlist request failed: ${playlistUrl} | ${err.message}`);
	} else {
		self.log('error', `Playlist request failed: ${playlistUrl} | ${JSON.stringify(err)}`);
	}
	throw err;
}
const json2 = JSON.parse(res2.body)
			const json: jsonData = {
				...json1,
				...json2,
			}
			let index: number = 0;
			let nextTrackName: string = '';
			let previousTrackName: string = '';
			const items = json.playlistItems && Array.isArray(json.playlistItems.items) ? json.playlistItems.items : [];
			if (json.player.activeItem.index > 0) {
				index = 1;
				nextTrackName = items.length >= 3 && items[2] && Array.isArray(items[2].columns) && typeof items[2].columns[0] === 'string' ? items[2].columns[0] : '';
				previousTrackName = items.length >= 1 && items[0] && Array.isArray(items[0].columns) && typeof items[0].columns[0] === 'string' ? items[0].columns[0] : '';
			} else {
				index = 0;
				nextTrackName = items.length >= 2 && items[1] && Array.isArray(items[1].columns) && typeof items[1].columns[0] === 'string' ? items[1].columns[0] : '';
				previousTrackName = '';
			}
			// Update currentTrackName if necessary
			const currentTrackName = items.length > index && items[index] && Array.isArray(items[index].columns) && typeof items[index].columns[0] === 'string' ? items[index].columns[0] : '';
			if (self.getVariableValue('currentTrackName') !== currentTrackName) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackName: currentTrackName,
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
			// Update currentTrackPosition if necessary
			json.player.activeItem.position = round(json.player.activeItem.position, self.config.decimalPlaces)
			if (self.getVariableValue('currentTrackPosition') !== json.player.activeItem.position) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackPosition: json.player.activeItem.position,
				}
			}
			// Set formatted track duration variable
			const formattedDuration = formatSecondsToMinSec(json.player.activeItem.duration);
			if (self.getVariableValue('currentTrackDurationFormatted') !== formattedDuration) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackDurationFormatted: formattedDuration,
				};
			}
			// Set formatted track position variable
			const formattedPosition = formatSecondsToMinSec(json.player.activeItem.position);
			if (self.getVariableValue('currentTrackPositionFormatted') !== formattedPosition) {
				varsToUpdate = {
					...varsToUpdate,
					currentTrackPositionFormatted: formattedPosition,
				}
			}
			// Set artist, album, and title variables if available, with safe checks to avoid tuple index errors
			let artist = '';
			let album = '';
			let title = '';
			if (Array.isArray(json.player.activeItem.columns)) {
				artist = typeof json.player.activeItem.columns[0] === 'string' ? json.player.activeItem.columns[0] : '';
				album = typeof json.player.activeItem.columns[1] === 'string' ? json.player.activeItem.columns[1] : '';
				title = typeof json.player.activeItem.columns[2] === 'string' ? json.player.activeItem.columns[2] : '';
			}
			if (self.getVariableValue('artist') !== artist) {
				varsToUpdate = {
					...varsToUpdate,
					artist,
				}
			}
			if (self.getVariableValue('album') !== album) {
				varsToUpdate = {
					...varsToUpdate,
					album,
				}
			}
			if (self.getVariableValue('title') !== title) {
				varsToUpdate = {
					...varsToUpdate,
					title,
				}
			}
			// Defensive check for playlist title extraction
			const playlistTitle =
				Array.isArray(json.playlists) &&
				typeof json.player.activeItem.playlistIndex === 'number' &&
				json.playlists[json.player.activeItem.playlistIndex] &&
				typeof json.playlists[json.player.activeItem.playlistIndex].title === 'string'
					? json.playlists[json.player.activeItem.playlistIndex].title
					: '';
			if (self.getVariableValue('currentPlaylistName') !== playlistTitle) {
				varsToUpdate = {
					...varsToUpdate,
					currentPlaylistName: playlistTitle,
				};
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
		self.log('error', `HTTP Request failed (${e.message})`)
		self.updateStatus(InstanceStatus.ConnectionFailure, e.message)

		// Reset variables when connection fails
		const emptyVars = {
			playbackState: 'stopped',
			currentTrackName: '',
			nextTrackName: '',
			currentPlaylistName: '',
			artist: '',
			album: '',
			title: '',
			currentTrackDuration: 0,
			currentTrackPosition: 0,
			previousTrackName: '',
		}
		self.setVariableValues(emptyVars)
	}
}
