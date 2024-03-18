// import type { UmbCreateFolderModel, UmbFolderDataSource, UmbUpdateFolderModel } from '@umbraco-cms/backoffice/tree';
// import { DocumentBlueprintResource } from '@umbraco-cms/backoffice/external/backend-api';
// import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
// import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';

// /**
//  * A data source for a Document Blueprint folder that fetches data from the server
//  * @export
//  * @class UmbDocumentBlueprintFolderServerDataSource
//  * @implements {RepositoryDetailDataSource}
//  */
// export class UmbDocumentBlueprintFolderServerDataSource implements UmbFolderDataSource {
// 	#host: UmbControllerHost;

// 	/**
// 	 * Creates an instance of UmbDocumentBlueprintFolderServerDataSource.
// 	 * @param {UmbControllerHost} host
// 	 * @memberof UmbDocumentBlueprintFolderServerDataSource
// 	 */
// 	constructor(host: UmbControllerHost) {
// 		this.#host = host;
// 	}

// 	/**
// 	 * Fetches a Document Blueprint folder from the server
// 	 * @param {string} unique
// 	 * @return {*}
// 	 * @memberof UmbDocumentBlueprintFolderServerDataSource
// 	 */
// 	async read(unique: string) {
// 		if (!unique) throw new Error('Unique is missing');

// 		const { data, error } = await tryExecuteAndNotify(
// 			this.#host,
// 			DocumentBlueprintResource.getDocumentBlueprintFolderById({
// 				id: unique,
// 			}),
// 		);

// 		if (data) {
// 			const mappedData = {
// 				unique: data.id,
// 				name: data.name,
// 			};

// 			return { data: mappedData };
// 		}

// 		return { error };
// 	}

// 	/**
// 	 * Creates a Document Blueprint folder on the server
// 	 * @param {UmbCreateFolderModel} args
// 	 * @return {*}
// 	 * @memberof UmbDocumentBlueprintFolderServerDataSource
// 	 */
// 	async create(args: UmbCreateFolderModel) {
// 		if (args.parentUnique === undefined) throw new Error('Parent unique is missing');
// 		if (!args.name) throw new Error('Name is missing');

// 		const requestBody = {
// 			id: args.unique,
// 			parent: args.parentUnique ? { id: args.parentUnique } : null,
// 			name: args.name,
// 		};

// 		const { error } = await tryExecuteAndNotify(
// 			this.#host,
// 			DocumentBlueprintResource.postDocumentBlueprintFolder({
// 				requestBody,
// 			}),
// 		);

// 		if (!error) {
// 			return this.read(args.unique);
// 		}

// 		return { error };
// 	}

// 	/**
// 	 * Updates a Document Blueprint folder on the server
// 	 * @param {UmbUpdateFolderModel} args
// 	 * @return {*}
// 	 * @memberof UmbDocumentBlueprintFolderServerDataSource
// 	 */
// 	async update(args: UmbUpdateFolderModel) {
// 		if (!args.unique) throw new Error('Unique is missing');
// 		if (!args.name) throw new Error('Folder name is missing');

// 		const { error } = await tryExecuteAndNotify(
// 			this.#host,
// 			DocumentBlueprintResource.putDocumentBlueprintFolderById({
// 				id: args.unique,
// 				requestBody: { name: args.name },
// 			}),
// 		);

// 		if (!error) {
// 			return this.read(args.unique);
// 		}

// 		return { error };
// 	}

// 	/**
// 	 * Deletes a Document Blueprint folder on the server
// 	 * @param {string} unique
// 	 * @return {*}
// 	 * @memberof UmbDocumentBlueprintServerDataSource
// 	 */
// 	async delete(unique: string) {
// 		if (!unique) throw new Error('Unique is missing');
// 		return tryExecuteAndNotify(
// 			this.#host,
// 			DocumentBlueprintResource.deleteDocumentBlueprintFolderById({
// 				id: unique,
// 			}),
// 		);
// 	}
// }
