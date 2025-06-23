import type { ModuleInstance } from './main.js'
import got from 'got'
import { InstanceStatus } from '@companion-module/base'

async function post(route: string, self: ModuleInstance) {
	try {
		await got.post(`http://${self.config.host}:${self.config.port}/api/${route}`)
		self.log('debug', `executed ${route}`)
		self.updateStatus(InstanceStatus.Ok)
	} catch (e: any) {
		self.log('error', `HTTP POST Request failed (${e.message})`)
		self.updateStatus(InstanceStatus.UnknownError, e.code)
	}
}

export async function UpdateActions(self: ModuleInstance): Promise<void> {
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
					value: `The song index is the index of the song in the Playlist (0 indexed) and the playlist id is the id of the playlist (you can get it via the [api](http://${self.config.host}:${self.config.port}/api/playlists))`,
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
	})
}
