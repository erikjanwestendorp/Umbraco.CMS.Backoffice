import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import type { UmbDocumentTypeWorkspaceContext } from '../../document-type-workspace.context.js';
import './document-type-workspace-view-edit-property.element.js';
import type { UmbDocumentTypeDetailModel } from '../../../types.js';
import type { UmbDocumentTypeWorkspacePropertyElement } from './document-type-workspace-view-edit-property.element.js';
import { css, html, customElement, property, state, repeat, ifDefined } from '@umbraco-cms/backoffice/external/lit';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import type { UmbPropertyContainerTypes, UmbPropertyTypeModel } from '@umbraco-cms/backoffice/content-type';
import { UmbContentTypePropertyStructureHelper } from '@umbraco-cms/backoffice/content-type';
import { UmbSorterController } from '@umbraco-cms/backoffice/sorter';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { UMB_PROPERTY_SETTINGS_MODAL, UmbModalRouteRegistrationController } from '@umbraco-cms/backoffice/modal';

@customElement('umb-document-type-workspace-view-edit-properties')
export class UmbDocumentTypeWorkspaceViewEditPropertiesElement extends UmbLitElement {
	#model: Array<UmbPropertyTypeModel> = [];
	#sorter = new UmbSorterController<UmbPropertyTypeModel, UmbDocumentTypeWorkspacePropertyElement>(this, {
		getUniqueOfElement: (element) => {
			return element.getAttribute('data-umb-property-id');
		},
		getUniqueOfModel: (modelEntry) => {
			return modelEntry.id;
		},
		identifier: 'document-type-property-sorter',
		itemSelector: 'umb-document-type-workspace-view-edit-property',
		disabledItemSelector: '[inherited]',
		//TODO: Set the property list (sorter wrapper) to inherited, if its inherited
		// This is because we don't want to move local properties into an inherited group container.
		// Or maybe we do, but we still need to check if the group exists locally, if not, then it needs to be created before we move a property into it.
		// TODO: Fix bug where a local property turn into an inherited when moved to a new group container.
		containerSelector: '#property-list',
		onChange: ({ item, model }) => {
			const isInNewContainer = model.find((entry) => entry?.container?.id !== this._containerId && this._containerId);
			if (isInNewContainer) {
				model.forEach((entry, index) => {
					entry.id === item.id
						? this._propertyStructureHelper.partialUpdateProperty(entry.id, {
								sortOrder: index,
								container: { id: this._containerId! },
						  })
						: this._propertyStructureHelper.partialUpdateProperty(entry.id, { sortOrder: index });
				});
			} else {
				model.forEach((entry, index) => {
					this._propertyStructureHelper.partialUpdateProperty(entry.id, { sortOrder: index });
				});
			}
		},
	});

	private _containerId: string | undefined;

	@property({ type: String, attribute: 'container-id', reflect: false })
	public get containerId(): string | undefined {
		return this._containerId;
	}
	public set containerId(value: string | undefined) {
		if (value === this._containerId) return;
		const oldValue = this._containerId;
		this._containerId = value;
		this.requestUpdate('containerId', oldValue);
	}

	@property({ type: String, attribute: 'container-name', reflect: false })
	public get containerName(): string | undefined {
		return this._propertyStructureHelper.getContainerName();
	}
	public set containerName(value: string | undefined) {
		this._propertyStructureHelper.setContainerName(value);
	}

	@property({ type: String, attribute: 'container-type', reflect: false })
	public get containerType(): UmbPropertyContainerTypes | undefined {
		return this._propertyStructureHelper.getContainerType();
	}
	public set containerType(value: UmbPropertyContainerTypes | undefined) {
		this._propertyStructureHelper.setContainerType(value);
	}

	_propertyStructureHelper = new UmbContentTypePropertyStructureHelper<UmbDocumentTypeDetailModel>(this);

	@state()
	_propertyStructure: Array<UmbPropertyTypeModel> = [];

	@state()
	_ownerDocumentTypes?: UmbDocumentTypeDetailModel[];

	@state()
	protected _modalRouteNewProperty?: string;

	@state()
	_sortModeActive?: boolean;

	constructor() {
		super();

		this.consumeContext(UMB_WORKSPACE_CONTEXT, async (workspaceContext) => {
			this._propertyStructureHelper.setStructureManager(
				(workspaceContext as UmbDocumentTypeWorkspaceContext).structure,
			);
			this.observe(
				(workspaceContext as UmbDocumentTypeWorkspaceContext).isSorting,
				(isSorting) => {
					this._sortModeActive = isSorting;
					if (isSorting) {
						this.#sorter.setModel(this._propertyStructure);
					} else {
						this.#sorter.setModel([]);
					}
				},
				'_observeIsSorting',
			);
			const docTypesObservable = await this._propertyStructureHelper.ownerDocumentTypes();
			if (!docTypesObservable) return;
			this.observe(
				docTypesObservable,
				(documents) => {
					this._ownerDocumentTypes = documents;
				},
				'observeOwnerDocumentTypes',
			);
		});
		this.observe(this._propertyStructureHelper.propertyStructure, (propertyStructure) => {
			this._propertyStructure = propertyStructure;
		});

		// Note: Route for adding a new property
		new UmbModalRouteRegistrationController(this, UMB_PROPERTY_SETTINGS_MODAL)
			.addAdditionalPath('new-property')
			.onSetup(async () => {
				const documentTypeId = this._ownerDocumentTypes?.find(
					(types) => types.containers?.find((containers) => containers.id === this.containerId),
				)?.unique;
				if (documentTypeId === undefined) return false;
				const propertyData = await this._propertyStructureHelper.createPropertyScaffold(this._containerId);
				if (propertyData === undefined) return false;
				return { data: { documentTypeId }, value: propertyData };
			})
			.onSubmit((value) => {
				if (!value.dataType) {
					throw new Error('No data type selected');
				}
				this.#addProperty(value as UmbPropertyTypeModel);
			})
			.observeRouteBuilder((routeBuilder) => {
				this._modalRouteNewProperty = routeBuilder(null);
			});
	}

	async #addProperty(propertyData: UmbPropertyTypeModel) {
		const propertyPlaceholder = await this._propertyStructureHelper.addProperty(this._containerId);
		if (!propertyPlaceholder) return;

		this._propertyStructureHelper.partialUpdateProperty(propertyPlaceholder.id, propertyData);
	}

	render() {
		return html`
			<div id="property-list" ?sort-mode-active=${this._sortModeActive}>
				${repeat(
					this._propertyStructure,
					(property) => '' + property.container?.id + property.id + '' + property.sortOrder,
					(property) => {
						// Note: This piece might be moved into the property component
						const inheritedFromDocument = this._ownerDocumentTypes?.find(
							(types) => types.containers?.find((containers) => containers.id === property.container?.id),
						);

						return html`
							<umb-document-type-workspace-view-edit-property
								data-umb-property-id=${property.id}
								owner-document-type-id=${ifDefined(inheritedFromDocument?.unique)}
								owner-document-type-name=${ifDefined(inheritedFromDocument?.name)}
								?inherited=${property.container?.id !== this.containerId}
								?sort-mode-active=${this._sortModeActive}
								.property=${property}
								@partial-property-update=${(event: CustomEvent) => {
									this._propertyStructureHelper.partialUpdateProperty(property.id, event.detail);
								}}
								@property-delete=${() => {
									this._propertyStructureHelper.removeProperty(property.id!);
								}}>
							</umb-document-type-workspace-view-edit-property>
						`;
					},
				)}
			</div>

			${!this._sortModeActive
				? html`<uui-button
						label=${this.localize.term('contentTypeEditor_addProperty')}
						id="add"
						look="placeholder"
						href=${ifDefined(this._modalRouteNewProperty)}>
						<umb-localize key="contentTypeEditor_addProperty">Add property</umb-localize>
				  </uui-button> `
				: ''}
		`;
	}

	static styles = [
		UmbTextStyles,
		css`
			#add {
				width: 100%;
			}

			#property-list[sort-mode-active]:not(:has(umb-document-type-workspace-view-edit-property)) {
				/* Some height so that the sorter can target the area if the group is empty*/
				min-height: var(--uui-size-layout-1);
			}
		`,
	];
}

export default UmbDocumentTypeWorkspaceViewEditPropertiesElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-document-type-workspace-view-edit-properties': UmbDocumentTypeWorkspaceViewEditPropertiesElement;
	}
}
