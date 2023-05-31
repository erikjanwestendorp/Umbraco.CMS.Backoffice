import type { UmbPropertyEditorExtensionElement } from '../interfaces/index.js';
import { DataTypePropertyPresentationModel } from '@umbraco-cms/backoffice/backend-api';
import type { ManifestElement, ManifestBase } from '@umbraco-cms/backoffice/extension-api';

export interface ManifestPropertyEditorUI extends ManifestElement<UmbPropertyEditorExtensionElement> {
	type: 'propertyEditorUI';
	meta: MetaPropertyEditorUI;
}

export interface MetaPropertyEditorUI {
	label: string;
	propertyEditorModel: string;
	icon: string;
	group: string;
	settings?: PropertyEditorSettings;
	supportsReadOnly?: boolean;
}

// Model
export interface ManifestPropertyEditorModel extends ManifestBase {
	type: 'propertyEditorModel';
	meta: MetaPropertyEditorModel;
}

export interface MetaPropertyEditorModel {
	defaultPropertyEditorUiAlias: string;
	settings?: PropertyEditorSettings;
}

// Config
export interface PropertyEditorSettings {
	properties: PropertyEditorConfigProperty[];
	// default data is kept separate from the properties, to give the ability for Property Editor UI to overwrite default values for the property editor settings.
	defaultData?: PropertyEditorConfigDefaultData[];
}

export interface PropertyEditorConfigProperty {
	label: string;
	description?: string;
	alias: string;
	propertyEditorUI: string;
	config?: Array<DataTypePropertyPresentationModel>;
}

export interface PropertyEditorConfigDefaultData {
	alias: string;
	value: unknown;
}
