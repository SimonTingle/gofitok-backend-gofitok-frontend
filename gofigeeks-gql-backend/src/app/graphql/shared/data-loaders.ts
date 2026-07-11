import DataLoader from 'dataloader'
import { loaders } from '../loaders'

export class DataLoaders {
	/**
	 * Appends resolvers for the fields defined in the loaders object. Each resolver will use the corresponding DataLoader from the context to load data based on the parent object and the arguments provided.
	 */
	static appendResolvers(
		resolversObj: Record<string, any>,
	): Record<string, any> {
		const result = { ...resolversObj }

		for (const [typeName, typeLoaders] of Object.entries(loaders)) {
			if (!result[typeName]) {
				result[typeName] = {}
			}

			for (const fieldName of Object.keys(typeLoaders)) {
				result[typeName][fieldName] = async (
					parent: any,
					args: any,
					context: any,
				) => {
					return await context.loaders[typeName][fieldName].load({
						obj: parent,
						params: args,
					})
				}
			}
		}

		return result
	}

	/**
	 * Creates a context object with DataLoader instances for all defined loaders.
	 * Automatically instantiates DataLoader for each loader function.
	 */
	static createContext() {
		const loaderInstances: Record<string, any> = {}

		for (const [typeName, typeLoaders] of Object.entries(loaders)) {
			loaderInstances[typeName] = {}

			for (const [fieldName, loaderFn] of Object.entries(typeLoaders)) {
				loaderInstances[typeName][fieldName] = new DataLoader(loaderFn as any)
			}
		}

		return {
			loaders: loaderInstances,
		}
	}
}
