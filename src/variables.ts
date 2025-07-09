import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'playbackState', name: 'Playback State' },
		{ variableId: 'currentTrackName', name: 'The name of the current track' },
		{ variableId: 'currentTrackDuration', name: 'The duration of the current track' },
		{ variableId: 'currentTrackPosition', name: 'The position of the playback of the current track' },
		{ variableId: 'nextTrackName', name: 'The name of the next track' },
		{ variableId: 'previousTrackName', name: 'The name of the previous track' },
		{ variableId: 'currentPlaylistName', name: 'The name of the current playlist' },
		{ variableId: 'currentTrackDurationFormatted', name: 'Current track duration (mm:ss)' },
		{ variableId: 'currentTrackPositionFormatted', name: 'Current track position (mm:ss)' },
		{ variableId: 'artist', name: 'Artist of the current track' },
		{ variableId: 'album', name: 'Album of the current track' },
		{ variableId: 'title', name: 'Title of the current track' },
	])
}
