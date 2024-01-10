import { UmbRelationServerDataSource } from './sources/relation.server.data.js';
import { type UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbBaseController } from '@umbraco-cms/backoffice/class-api';
import { UmbNotificationContext, UMB_NOTIFICATION_CONTEXT_TOKEN } from '@umbraco-cms/backoffice/notification';
import { UmbApi } from '@umbraco-cms/backoffice/extension-api';

export class UmbRelationRepository extends UmbBaseController implements UmbApi {
	#init!: Promise<unknown>;

	#detailDataSource: UmbRelationServerDataSource;
	#notificationContext?: UmbNotificationContext;

	constructor(host: UmbControllerHost) {
		super(host);

		// TODO: figure out how spin up get the correct data source
		this.#detailDataSource = new UmbRelationServerDataSource(this._host);

		this.#init = Promise.all([
			this.consumeContext(UMB_NOTIFICATION_CONTEXT_TOKEN, (instance) => {
				this.#notificationContext = instance;
			}).asPromise(),
		]);
	}

	async requestById(id: string) {
		await this.#init;

		// TODO: should we show a notification if the id is missing?
		// Investigate what is best for Acceptance testing, cause in that perspective a thrown error might be the best choice?
		if (!id) {
			throw new Error('Id is missing');
		}

		const { data, error } = await this.#detailDataSource.read(id);

		return { data, error };
	}

	async requestChildRelationById(childId: string, relationTypeAlias?: string) {
		await this.#init;

		// TODO: should we show a notification if the id is missing?
		// Investigate what is best for Acceptance testing, cause in that perspective a thrown error might be the best choice?
		if (!childId) {
			throw new Error('Id is missing');
		}

		const { data, error } = await this.#detailDataSource.readChildRelations(childId, relationTypeAlias);

		return { data, error };
	}
}