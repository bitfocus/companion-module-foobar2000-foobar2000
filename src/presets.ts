import { combineRgb, type CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {
		play: {
			type: 'button',
			category: 'Playback Control',
			name: 'Play',
			style: {
				text: 'PLAY',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 128, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'play',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		pause: {
			type: 'button',
			category: 'Playback Control',
			name: 'Pause',
			style: {
				text: 'PAUSE',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 165, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'pause',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		stop: {
			type: 'button',
			category: 'Playback Control',
			name: 'Stop',
			style: {
				text: 'STOP',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'stop',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		togglePlayPause: {
			type: 'button',
			category: 'Playback Control',
			name: 'Play/Pause Toggle',
			style: {
				text: 'PLAY\\n/PAUSE',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 128),
			},
			steps: [
				{
					down: [
						{
							actionId: 'togglePlayPause',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'playbackState',
					options: {
						playbackState: 'playing',
					},
					style: {
						bgcolor: combineRgb(0, 128, 0),
						text: 'PLAYING',
					},
				},
				{
					feedbackId: 'playbackState',
					options: {
						playbackState: 'paused',
					},
					style: {
						bgcolor: combineRgb(255, 165, 0),
						text: 'PAUSED',
					},
				},
			],
		},
		next: {
			type: 'button',
			category: 'Track Navigation',
			name: 'Next Track',
			style: {
				text: 'NEXT\\nTRACK',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(64, 64, 64),
			},
			steps: [
				{
					down: [
						{
							actionId: 'next',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		previous: {
			type: 'button',
			category: 'Track Navigation',
			name: 'Previous Track',
			style: {
				text: 'PREV\\nTRACK',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(64, 64, 64),
			},
			steps: [
				{
					down: [
						{
							actionId: 'previous',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		currentTrack: {
			type: 'text',
			category: 'Information',
			name: 'Current Track Name',
			text: '$(foobar2000:currentTrackName)',
		},
		playbackStatus: {
			type: 'text',
			category: 'Information',
			name: 'Playback Status',
			text: '$(foobar2000:playbackState)',
		},
	}

	self.setPresetDefinitions(presets)
}
