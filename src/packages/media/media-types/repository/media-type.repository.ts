import { UmbMediaTypeTreeStore, UMB_MEDIA_TYPE_TREE_STORE_CONTEXT_TOKEN } from './media-type.tree.store.js';
import { UmbMediaTypeDetailServerDataSource } from './sources/media-type.detail.server.data.js';
import { UmbMediaTypeStore, UMB_MEDIA_TYPE_STORE_CONTEXT_TOKEN } from './media-type.detail.store.js';
import { UmbMediaTypeTreeServerDataSource } from './sources/media-type.tree.server.data.js';
import { UmbContextConsumerController } from '@umbraco-cms/backoffice/context-api';
import { UmbControllerHostElement } from '@umbraco-cms/backoffice/controller-api';
import { UmbNotificationContext, UMB_NOTIFICATION_CONTEXT_TOKEN } from '@umbraco-cms/backoffice/notification';
import { UmbTreeRepository, UmbTreeDataSource } from '@umbraco-cms/backoffice/repository';
import {
	CreateMediaTypeRequestModel,
	EntityTreeItemResponseModel,
	MediaTypeResponseModel,
	UpdateMediaTypeRequestModel,
} from '@umbraco-cms/backoffice/backend-api';

export class UmbMediaTypeRepository implements UmbTreeRepository<EntityTreeItemResponseModel> {
	#init!: Promise<unknown>;

	#host: UmbControllerHostElement;

	#treeSource: UmbTreeDataSource;
	#treeStore?: UmbMediaTypeTreeStore;

	#detailSource: UmbMediaTypeDetailServerDataSource;
	#detailStore?: UmbMediaTypeStore;

	#notificationContext?: UmbNotificationContext;

	constructor(host: UmbControllerHostElement) {
		this.#host = host;

		// TODO: figure out how spin up get the correct data source
		this.#treeSource = new UmbMediaTypeTreeServerDataSource(this.#host);
		this.#detailSource = new UmbMediaTypeDetailServerDataSource(this.#host);

		this.#init = Promise.all([
			new UmbContextConsumerController(this.#host, UMB_MEDIA_TYPE_STORE_CONTEXT_TOKEN, (instance) => {
				this.#detailStore = instance;
			}),

			new UmbContextConsumerController(this.#host, UMB_MEDIA_TYPE_TREE_STORE_CONTEXT_TOKEN, (instance) => {
				this.#treeStore = instance;
			}),

			new UmbContextConsumerController(this.#host, UMB_NOTIFICATION_CONTEXT_TOKEN, (instance) => {
				this.#notificationContext = instance;
			}),
		]);
	}

	// TREE:
	async requestTreeRoot() {
		await this.#init;

		const data = {
			id: null,
			type: 'media-type-root',
			name: 'Media Types',
			icon: 'umb:folder',
			hasChildren: true,
		};

		return { data };
	}

	async requestRootTreeItems() {
		await this.#init;

		const { data, error } = await this.#treeSource.getRootItems();

		if (data) {
			this.#treeStore?.appendItems(data.items);
		}

		return { data, error, asObservable: () => this.#treeStore!.rootItems };
	}

	async requestTreeItemsOf(parentId: string | null) {
		await this.#init;
		if (parentId === undefined) throw new Error('Parent id is missing');

		const { data, error } = await this.#treeSource.getChildrenOf(parentId);

		if (data) {
			this.#treeStore?.appendItems(data.items);
		}

		return { data, error, asObservable: () => this.#treeStore!.childrenOf(parentId) };
	}

	async requestItemsLegacy(ids: Array<string>) {
		await this.#init;

		if (!ids) {
			throw new Error('Ids are missing');
		}

		const { data, error } = await this.#treeSource.getItems(ids);

		return { data, error, asObservable: () => this.#treeStore!.items(ids) };
	}

	async rootTreeItems() {
		await this.#init;
		return this.#treeStore!.rootItems;
	}

	async treeItemsOf(parentId: string | null) {
		await this.#init;
		return this.#treeStore!.childrenOf(parentId);
	}

	async itemsLegacy(ids: Array<string>) {
		await this.#init;
		return this.#treeStore!.items(ids);
	}

	// DETAILS

	async createScaffold() {
		await this.#init;
		return this.#detailSource.createScaffold();
	}

	async requestById(id: string) {
		await this.#init;
		// TODO: should we show a notification if the id is missing?
		// Investigate what is best for Acceptance testing, cause in that perspective a thrown error might be the best choice?
		if (!id) {
			throw new Error('Id is missing');
		}
		const { data, error } = await this.#detailSource.get(id);

		if (data) {
			this.#detailStore?.append(data);
		}
		return { data, error };
	}

	async delete(id: string) {
		await this.#init;
		return this.#detailSource.delete(id);
	}

	async save(id: string, item: UpdateMediaTypeRequestModel) {
		if (!id) throw new Error('Data Type id is missing');
		if (!item) throw new Error('Media Type is missing');
		await this.#init;

		const { error } = await this.#detailSource.update(id, item);

		if (!error) {
			this.#detailStore?.append(item);
			this.#treeStore?.updateItem(id, item);

			const notification = { data: { message: `Media type '${item.name}' saved` } };
			this.#notificationContext?.peek('positive', notification);
		}

		return { error };
	}

	async create(mediaType: CreateMediaTypeRequestModel) {
		if (!mediaType || !mediaType.id) throw new Error('Document Type is missing');
		await this.#init;

		const { error } = await this.#detailSource.insert(mediaType);

		if (!error) {
			//TODO: Model mismatch. FIX
			this.#detailStore?.append(mediaType as unknown as MediaTypeResponseModel);

			const treeItem = {
				type: 'media-type',
				parentId: null,
				name: mediaType.name,
				id: mediaType.id,
				isFolder: false,
				isContainer: false,
				hasChildren: false,
			};
			this.#treeStore?.appendItems([treeItem]);
		}

		return { error };
	}

	async move() {
		alert('move me!');
	}

	async copy() {
		alert('copy me');
	}
}
