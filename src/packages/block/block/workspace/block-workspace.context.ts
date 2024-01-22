import type { UmbBlockLayoutBaseModel, UmbBlockDataType } from '../types.js';
import { UmbBlockElementManager } from './block-element-manager.js';
import { UmbEditableWorkspaceContextBase } from '@umbraco-cms/backoffice/workspace';
import { UmbBooleanState, UmbObjectState, UmbStringState } from '@umbraco-cms/backoffice/observable-api';
import { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { ManifestWorkspace } from '@umbraco-cms/backoffice/extension-registry';
import { UmbId } from '@umbraco-cms/backoffice/id';
import { UMB_BLOCK_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/block';
import { buildUdi } from '@umbraco-cms/backoffice/utils';

export class UmbBlockWorkspaceContext<
	LayoutDataType extends UmbBlockLayoutBaseModel = UmbBlockLayoutBaseModel,
> extends UmbEditableWorkspaceContextBase<LayoutDataType> {
	// Just for context token safety:
	public readonly IS_BLOCK_WORKSPACE_CONTEXT = true;
	//
	readonly workspaceAlias;

	#blockManager?: typeof UMB_BLOCK_MANAGER_CONTEXT.TYPE;
	#retrieveBlockManager;

	#entityType: string;

	#isNew = new UmbBooleanState<boolean | undefined>(undefined);
	readonly isNew = this.#isNew.asObservable();

	#layout = new UmbObjectState<LayoutDataType | undefined>(undefined);
	readonly layout = this.#layout.asObservable();
	//readonly unique = this.#layout.asObservablePart((x) => x?.contentUdi);
	readonly contentUdi = this.#layout.asObservablePart((x) => x?.contentUdi);

	readonly content = new UmbBlockElementManager(this);

	readonly settings = new UmbBlockElementManager(this);

	// TODO: Get the name of the contentElementType..
	#label = new UmbStringState<string | undefined>(undefined);
	readonly name = this.#label.asObservable();

	constructor(host: UmbControllerHost, workspaceArgs: { manifest: ManifestWorkspace }) {
		// TODO: We don't need a repo here, so maybe we should not require this of the UmbEditableWorkspaceContextBase
		super(host, workspaceArgs.manifest.alias);
		this.#entityType = workspaceArgs.manifest.meta?.entityType;
		this.workspaceAlias = workspaceArgs.manifest.alias;

		this.#retrieveBlockManager = this.consumeContext(UMB_BLOCK_MANAGER_CONTEXT, (context) => {
			this.#blockManager = context;
		}).asPromise();
	}

	async load(unique: string) {
		await this.#retrieveBlockManager;
		if (!this.#blockManager) {
			throw new Error('Block manager not found');
			return;
		}

		this.observe(
			this.#blockManager.layoutOf(unique),
			(layoutData) => {
				this.#layout.setValue(layoutData as LayoutDataType);

				//
				// Content:
				const contentUdi = layoutData?.contentUdi;
				if (contentUdi) {
					this.observe(
						this.#blockManager!.contentOf(contentUdi),
						(contentData) => {
							this.content.setData(contentData);
						},
						'observeContent',
					);
				}

				// Settings:
				const settingsUdi = layoutData?.settingsUdi;
				if (settingsUdi) {
					this.observe(
						this.#blockManager!.settingsOf(settingsUdi),
						(settingsData) => {
							this.settings.setData(settingsData);
						},
						'observeSettings',
					);
				}
			},
			'observeLayout',
		);

		/*
		if ( liveEditingMode) {
			this.observe(this.layout, (layoutData) => {
				if(layoutData) {
					this.#blockManager?.setOneLayout(layoutData);
				}
			});
			this.observe(this.content.data, (contentData) => {
				if(contentData) {
					this.#blockManager?.setOneContent(contentData);
				}
			});
		}
		*/
	}

	async create(contentElementTypeId: string) {
		//
		// TODO: Condense this into some kind of create method?
		const key = UmbId.new();
		const contentUdi = buildUdi('block', key);
		const layout: UmbBlockLayoutBaseModel = {
			contentUdi: contentUdi,
		};
		const content: UmbBlockDataType = {
			udi: contentUdi,
			contentTypeKey: contentElementTypeId,
		};
		this.content.setData(content);

		// TODO: If we have Settings dedicated to this block type, we initiate them here:

		this.setIsNew(true);
		this.#layout.setValue(layout as LayoutDataType);
	}

	getIsNew() {
		return this.#isNew.value;
	}
	setIsNew(value: boolean): void {
		this.#isNew.setValue(value);
	}

	getData() {
		return this.#layout.getValue();
	}

	getEntityId() {
		return this.getData()!.contentUdi;
	}

	getEntityType() {
		return this.#entityType;
	}

	getName() {
		return 'block name content element type here...';
	}

	// NOTICE currently the property methods are for layout, but this could be seen as wrong, we might need to dedicate a data manager for the layout as well.

	async propertyValueByAlias<propertyAliasType extends keyof LayoutDataType>(propertyAlias: propertyAliasType) {
		return this.#layout.asObservablePart(
			(layout) => layout?.[propertyAlias as keyof LayoutDataType] as LayoutDataType[propertyAliasType],
		);
	}

	getPropertyValue<propertyAliasType extends keyof LayoutDataType>(propertyAlias: propertyAliasType) {
		// TODO: Should be using Content, then we need a toggle or another method for getting settings.
		return this.#layout.getValue()?.[propertyAlias as keyof LayoutDataType] as LayoutDataType[propertyAliasType];
	}

	async setPropertyValue(alias: string, value: unknown) {
		const currentData = this.#layout.value;
		if (currentData) {
			this.#layout.update({ ...currentData, [alias]: value });
		}
	}

	async save() {
		const layoutData = this.#layout.value;
		const contentData = this.content.getData();
		if (!layoutData || !this.#blockManager || !contentData) return;

		if (this.getIsNew() === true) {
			const blockCreated = this.#blockManager.createBlock(layoutData, contentData.contentTypeKey);
			if (!blockCreated) {
				throw new Error('Block Manager could not create block');
				return;
			}
		}

		// TODO: Save the block, but only in non-live-editing mode.
		this.#blockManager.setOneLayout(layoutData);

		if (contentData) {
			this.#blockManager.setOneContent(contentData);
		}
		const settingsData = this.settings.getData();
		if (settingsData) {
			this.#blockManager.setOneSettings(settingsData);
		}

		this.saveComplete(layoutData);
	}

	public destroy(): void {
		this.#layout.destroy();
	}
}

export default UmbBlockWorkspaceContext;
