import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	updateFrequency: number
	decimalPlaces: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'Information',
			width: 12,
			value:
				'The `Foobar Host` is the ip of the computer running foobar2000. The `Foobar Port` is the port configured for beefweb in foobar2000. `Update Frequency` is the update frequency in ms and `Decimal Places` is the number of decimal places that the time gets rounded to.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Foobar Host',
			width: 8,
			regex: Regex.IP,
			default: '127.0.0.1',
			required: true,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Foobar Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 8880,
			required: true,
		},
		{
			type: 'number',
			id: 'updateFrequency',
			label: 'Update Frequency',
			width: 4,
			min: 1,
			max: 10000,
			default: 1000,
			required: true,
		},
		{
			type: 'number',
			id: 'decimalPlaces',
			label: 'Decimal Places',
			width: 4,
			min: 0,
			max: 3,
			default: 3,
			required: true,
		},
	]
}
