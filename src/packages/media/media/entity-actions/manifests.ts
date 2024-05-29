import { UMB_MEDIA_DETAIL_REPOSITORY_ALIAS, UMB_MEDIA_ITEM_REPOSITORY_ALIAS } from '../repository/index.js';
import { UMB_MEDIA_ENTITY_TYPE } from '../entity.js';
import { manifests as createManifests } from './create/manifests.js';
import { manifests as moveManifests } from './move-to/manifests.js';
import { manifests as sortChildrenOfManifests } from './sort-children-of/manifests.js';
import type { ManifestTypes } from '@umbraco-cms/backoffice/extension-registry';
import { UMB_ENTITY_IS_TRASHED_CONDITION_ALIAS } from '@umbraco-cms/backoffice/recycle-bin';

const entityActions: Array<ManifestTypes> = [
	...createManifests,
	{
		type: 'entityAction',
		alias: 'Umb.EntityAction.Media.Delete',
		name: 'Delete Media Entity Action ',
		kind: 'delete',
		forEntityTypes: [UMB_MEDIA_ENTITY_TYPE],
		meta: {
			itemRepositoryAlias: UMB_MEDIA_ITEM_REPOSITORY_ALIAS,
			detailRepositoryAlias: UMB_MEDIA_DETAIL_REPOSITORY_ALIAS,
		},
		conditions: [
			{
				alias: UMB_ENTITY_IS_TRASHED_CONDITION_ALIAS,
			},
		],
	},
];

export const manifests: Array<ManifestTypes> = [...entityActions, ...moveManifests, ...sortChildrenOfManifests];
