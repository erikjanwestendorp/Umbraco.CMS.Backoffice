import { UmbStoreBase } from '../store-base.js';
import type { UmbDetailStore } from './detail-store.interface.js';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbArrayState } from '@umbraco-cms/backoffice/observable-api';

/**
 * @class UmbDetailStoreBase
 * @augments {UmbStoreBase}
 * @description - Data Store for Data Type items
 */

export abstract class UmbDetailStoreBase<T extends { unique: string }>
	extends UmbStoreBase<T>
	implements UmbDetailStore<T>
{
	/**
	 * Creates an instance of UmbDetailStoreBase.
	 * @param {UmbControllerHost} host - The controller host for this controller to be appended to
	 * @param storeAlias
	 * @memberof UmbDetailStoreBase
	 */
	constructor(host: UmbControllerHost, storeAlias: string) {
		super(host, storeAlias, new UmbArrayState<T>([], (x) => x.unique));
	}

	/**
	 * Retrieve a detail model from the store
	 * @param {unique} string unique
	 * @param unique
	 * @memberof UmbDetailStoreBase
	 */
	byUnique(unique: string) {
		return this._data.asObservablePart((x) => x.find((y) => y.unique === unique));
	}
}
