import type { ModuleInstance } from './main.js'
import got from 'got'
import { InstanceStatus } from '@companion-module/base'

async function post(route: string, self: ModuleInstance, options?: object) {
	try {
		await got.post(`http://${self.config.host}:${self.config.port}/api/${route}`, options)
		self.log('debug', `executed ${route}`)
		self.updateStatus(InstanceStatus.Ok)
	} catch (e: any) {
		self.log('error', `HTTP POST Request failed (${e.message})`)
		self.updateStatus(InstanceStatus.UnknownError, e.code)
	}
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		play: {
			name: 'Play',
			options: [],
			callback: async () => {
				await post('player/play', self)
			},
		},
		pause: {
			name: 'Pause',
			options: [],
			callback: async () => {
				await post('player/pause', self)
			},
		},
		stop: {
			name: 'Stop',
			options: [],
			callback: async () => {
				await post('player/stop', self)
			},
		},
		togglePlayPause: {
			name: 'Toggle Play Pause',
			options: [],
			callback: async () => {
				await post('player/play-pause', self)
			},
		},
		next: {
			name: 'Play Next',
			options: [],
			callback: async () => {
				await post('player/next', self)
			},
		},
		previous: {
			name: 'Play Previous',
			options: [],
			callback: async () => {
				await post('player/previous', self)
			},
		},
		playSpecific: {
			name: 'Play Specific',
			options: [
				{
					id: 'info',
					type: 'static-text',
					label: 'Information',
					value: `The song index is the index of the song in the Playlist (0 indexed) and the playlist id is the id of the playlist (you can get it via the api at http://${self.config.host}:${self.config.port}/api/playlists)`,
				},
				{
					id: 'playlist',
					type: 'textinput',
					label: 'Playlist',
					required: true,
					useVariables: true,
				},
				{
					id: 'index',
					type: 'number',
					label: 'Song Index',
					default: 0,
					min: 0,
					max: 1000,
					required: true,
				},
			],
			callback: async (event, context) => {
				await post(
					`player/play/${await context.parseVariablesInString(<string>event.options.playlist)}/${event.options.index}`,
					self,
				)
			},
		},
		sortPlaylist: {
			name: 'Sort Playlist',
			options: [
				{
					id: 'info',
					type: 'static-text',
					label: 'Information',
					value: `The playlist id is the id of the playlist (you can get it via the api at http://${self.config.host}:${self.config.port}/api/playlists)`,
				},
				{
					id: 'playlist',
					type: 'textinput',
					label: 'Playlist',
					required: true,
					useVariables: true,
				},
				{
					id: 'by',
					type: 'dropdown',
					label: 'Sort by',
					choices: [
						{ id: 'random', label: 'Random' },
						{ id: 'artist', label: 'Artist' },
						{ id: 'album', label: 'Album' },
						{ id: 'track', label: 'Track number' },
						{ id: 'date', label: 'Date' },
						{ id: 'title', label: 'Title' },
					],
					default: 'random',
				},
			],
			callback: async (event, context) => {
				const sortmode = await context.parseVariablesInString(<string>event.options.by)
				let payload: object
				if (sortmode === 'random') {
					payload = { random: true }
				} else {
					payload = { by: '%' + sortmode + '%', desc: false }
				}
				await post(
					`playlists/${await context.parseVariablesInString(<string>event.options.playlist)}/items/sort`,
					self,
					{ json: payload },
				)
			},
		},
	})
}
