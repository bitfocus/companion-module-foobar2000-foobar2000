import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdateVariables } from './util.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	updater!: { id: string; job: NodeJS.Timeout }[]

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updater = []

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets

		// Initialize variables with default values
		this.setVariableValues({
			playbackState: 'stopped',
			currentTrackName: '',
			nextTrackName: '',
			currentPlaylistName: '',
			currentTrackDuration: 0,
			currentTrackPosition: 0,
			previousTrackName: '',
		})

		// Update both variables and feedbacks at the configured interval
		this.updater.push({
			id: 'varAndFeedbackUpdate',
			job: setInterval(() => {
				// First update the variables
				void UpdateVariables(this)
				// Then trigger feedback refresh
				this.checkFeedbacks()
			}, this.config.updateFrequency),
		})
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		// Clear all updaters
		for (const updater of this.updater) {
			clearInterval(updater.job)
		}
		this.updater = []
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		// Clear existing updaters before creating new ones
		for (const updater of this.updater) {
			clearInterval(updater.job)
		}
		this.updater = []

		// Create new updater with new config
		this.updater.push({
			id: 'varAndFeedbackUpdate',
			job: setInterval(() => {
				// First update the variables
				void UpdateVariables(this)
				// Then trigger feedback refresh
				this.checkFeedbacks()
			}, this.config.updateFrequency),
		})
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
