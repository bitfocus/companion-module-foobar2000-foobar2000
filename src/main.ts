import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdateVariables } from './util.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
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

		await this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions

		this.updater.push({
			id: 'varUpdate',
			job: setInterval(() => {
				void UpdateVariables(this)
			}, this.config.updateFrequency),
		})
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		for (const updater of this.updater) {
			updater.job.close()
		}
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		for (const updater of this.updater) {
			updater.job.close()
		}
		this.updater.push({
			id: 'varUpdate',
			job: setInterval(() => {
				void UpdateVariables(this)
			}, this.config.updateFrequency),
		})
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	async updateActions(): Promise<void> {
		await UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
