import type { UmbDictionaryDetailModel } from '../types.js';
import { UMB_DICTIONARY_DETAIL_STORE_CONTEXT } from '../repository/detail/dictionary-detail.store.js';
import type { UmbDictionaryTreeItemModel } from './types.js';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import type { UmbControllerHostElement } from '@umbraco-cms/backoffice/controller-api';
import { UmbStoreConnector } from '@umbraco-cms/backoffice/store';
import { UmbUniqueTreeStore } from '@umbraco-cms/backoffice/tree';

/**
 * @export
 * @class UmbDictionaryTreeStore
 * @extends {UmbUniqueTreeStore}
 * @description - Tree Data Store for Dictionary Items
 */
export class UmbDictionaryTreeStore extends UmbUniqueTreeStore {
	/**
	 * Creates an instance of UmbDictionaryTreeStore.
	 * @param {UmbControllerHostElement} host
	 * @memberof UmbDictionaryTreeStore
	 */
	constructor(host: UmbControllerHostElement) {
		super(host, UMB_DICTIONARY_TREE_STORE_CONTEXT.toString());

		new UmbStoreConnector<UmbDictionaryTreeItemModel, UmbDictionaryDetailModel>(
			host,
			this,
			UMB_DICTIONARY_DETAIL_STORE_CONTEXT,
			(item) => this.#createTreeItemMapper(item),
			(item) => this.#updateTreeItemMapper(item),
		);
	}

	// TODO: revisit this when we have decided on detail model sizes
	#createTreeItemMapper = (item: UmbDictionaryDetailModel) => {
		const treeItem: UmbDictionaryTreeItemModel = {
			unique: item.unique,
			parentUnique: null,
			name: item.name,
			entityType: item.entityType,
			isFolder: false,
			hasChildren: false,
		};

		return treeItem;
	};

	// TODO: revisit this when we have decided on detail model sizes
	#updateTreeItemMapper = (model: UmbDictionaryDetailModel) => {
		return {
			name: model.name,
		};
	};
}

export const UMB_DICTIONARY_TREE_STORE_CONTEXT = new UmbContextToken<UmbDictionaryTreeStore>('UmbDictionaryTreeStore');