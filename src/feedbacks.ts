import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		playbackState: {
			name: 'Playback State',
			description: 'Change color based on playback state',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'playbackState',
					type: 'dropdown',
					label: 'Playback State',
					default: 'playing',
					choices: [
						{ id: 'playing', label: 'Playing' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'stopped', label: 'Stopped' },
					],
				},
			],
			callback: async (feedback) => {
				return feedback.options.playbackState === self.getVariableValue('playbackState')
			},
		},
		timingInfo: {
			name: 'Timing Info',
			description: 'Display track timing info (position, duration, or both)',
			type: 'advanced',
			options: [
				{
					id: 'timingType',
					type: 'dropdown',
					label: 'Timing Info to Display',
					choices: [
						{ id: 'position', label: 'Track Position' },
						{ id: 'duration', label: 'Track Duration' },
						{ id: 'both', label: 'Position / Duration' },
					],
					default: 'both',
				},
				{
					id: 'separator',
					type: 'textinput',
					label: 'Separator (for both)',
					default: ' / ',
					isVisible: (options: any) => options.timingType === 'both',
				},
			],
			callback: async (feedback: any) => {
				const position = String(self.getVariableValue('currentTrackPositionFormatted') || '')
				const duration = String(self.getVariableValue('currentTrackDurationFormatted') || '')
				const sep = typeof feedback.options.separator === 'string' ? feedback.options.separator : ' / '
				let text = ''
				switch (feedback.options.timingType) {
					case 'position':
						text = position
						break
					case 'duration':
						text = duration
						break
					case 'both':
						text = `${position}${sep}${duration}`
						break
					default:
						text = `${position}${sep}${duration}`
				}
				return { text: String(text) }
			},
		},
		trackInfo: {
			name: 'Track Info',
			description: 'Display track metadata (artist, album, title, or combinations)',
			type: 'advanced',
			options: [
				{
					id: 'trackType',
					type: 'dropdown',
					label: 'Track Info to Display',
					choices: [
						{ id: 'artist', label: 'Artist' },
						{ id: 'album', label: 'Album' },
						{ id: 'title', label: 'Title' },
						{ id: 'artist_title', label: 'Artist - Title' },
						{ id: 'artist_album_title', label: 'Artist / Album / Title' },
						{ id: 'custom', label: 'Custom Format' },
					],
					default: 'artist_album_title',
				},
				{
					id: 'customFormat',
					type: 'textinput',
					label: 'Custom Format (use {artist}, {album}, {title})',
					default: '{artist} / {album} / {title}',
					isVisible: (options: any) => options.trackType === 'custom',
				},
				{
					id: 'separator',
					type: 'textinput',
					label: 'Separator (for Artist/Album/Title)',
					default: ' / ',
					isVisible: (options: any) => ['artist_album_title'].includes(options.trackType),
				},
			],
			callback: async (feedback: any) => {
				const artist = String(self.getVariableValue('artist') || '')
				const album = String(self.getVariableValue('album') || '')
				const title = String(self.getVariableValue('title') || '')
				const sep = typeof feedback.options.separator === 'string' ? feedback.options.separator : ' / '
				let text = ''
				switch (feedback.options.trackType) {
					case 'artist':
						text = artist
						break
					case 'album':
						text = album
						break
					case 'title':
						text = title
						break
					case 'artist_title':
						text = artist && title ? `${artist} - ${title}` : artist || title
						break
					case 'artist_album_title':
						text = [artist, album, title].filter(Boolean).join(sep)
						break
					case 'custom':
						text = (typeof feedback.options.customFormat === 'string' ? feedback.options.customFormat : '')
							.replace('{artist}', artist)
							.replace('{album}', album)
							.replace('{title}', title)
						break
					default:
						text = [artist, album, title].filter(Boolean).join(sep)
				}
				return { text: String(text) }
			},
		},
	})
}
