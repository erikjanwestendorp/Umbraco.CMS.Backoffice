import type { UmbCreateFolderModel, UmbFolderDataSource, UmbUpdateFolderModel } from '@umbraco-cms/backoffice/tree';
import { MediaTypeService } from '@umbraco-cms/backoffice/external/backend-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';

/**
 * A data source for a Media Type folder that fetches data from the server
 * @class UmbMediaTypeFolderServerDataSource
 * @implements {RepositoryDetailDataSource}
 */
export class UmbMediaTypeFolderServerDataSource implements UmbFolderDataSource {
	#host: UmbControllerHost;

	/**
	 * Creates an instance of UmbMediaTypeFolderServerDataSource.
	 * @param {UmbControllerHost} host - The controller host for this controller to be appended to
	 * @memberof UmbMediaTypeFolderServerDataSource
	 */
	constructor(host: UmbControllerHost) {
		this.#host = host;
	}

	/**
	 * Fetches a Media Type folder from the server
	 * @param {string} unique
	 * @returns {*}
	 * @memberof UmbMediaTypeFolderServerDataSource
	 */
	async read(unique: string) {
		if (!unique) throw new Error('Unique is missing');

		const { data, error } = await tryExecuteAndNotify(
			this.#host,
			MediaTypeService.getMediaTypeFolderById({
				id: unique,
			}),
		);

		if (data) {
			const mappedData = {
				unique: data.id,
				name: data.name,
			};

			return { data: mappedData };
		}

		return { error };
	}

	/**
	 * Creates a Media Type folder on the server
	 * @param {UmbCreateFolderModel} args
	 * @returns {*}
	 * @memberof UmbMediaTypeFolderServerDataSource
	 */
	async create(args: UmbCreateFolderModel) {
		if (args.parentUnique === undefined) throw new Error('Parent unique is missing');
		if (!args.name) throw new Error('Name is missing');

		const requestBody = {
			id: args.unique,
			parent: args.parentUnique ? { id: args.parentUnique } : null,
			name: args.name,
		};

		const { error } = await tryExecuteAndNotify(
			this.#host,
			MediaTypeService.postMediaTypeFolder({
				requestBody,
			}),
		);

		if (!error) {
			return this.read(args.unique);
		}

		return { error };
	}

	/**
	 * Updates a Media Type folder on the server
	 * @param {UmbUpdateFolderModel} args
	 * @returns {*}
	 * @memberof UmbMediaTypeFolderServerDataSource
	 */
	async update(args: UmbUpdateFolderModel) {
		if (!args.unique) throw new Error('Unique is missing');
		if (!args.name) throw new Error('Folder name is missing');

		const { error } = await tryExecuteAndNotify(
			this.#host,
			MediaTypeService.putMediaTypeFolderById({
				id: args.unique,
				requestBody: { name: args.name },
			}),
		);

		if (!error) {
			return this.read(args.unique);
		}

		return { error };
	}

	/**
	 * Deletes a Media Type folder on the server
	 * @param {string} unique
	 * @returns {*}
	 * @memberof UmbMediaTypeServerDataSource
	 */
	async delete(unique: string) {
		if (!unique) throw new Error('Unique is missing');
		return tryExecuteAndNotify(
			this.#host,
			MediaTypeService.deleteMediaTypeFolderById({
				id: unique,
			}),
		);
	}
}
