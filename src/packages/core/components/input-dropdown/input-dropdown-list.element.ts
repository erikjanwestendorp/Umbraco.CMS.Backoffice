import { css, html, nothing, customElement, property, query, state } from '@umbraco-cms/backoffice/external/lit';
import { FormControlMixin, UUISelectEvent } from '@umbraco-cms/backoffice/external/uui';
import { UmbLitElement } from '@umbraco-cms/internal/lit-element';

@customElement('umb-input-dropdown-list')
export class UmbInputDropdownListElement extends FormControlMixin(UmbLitElement) {
	@property({ type: Array })
	public options?: Array<Option>;

	@property({ type: String })
	public placeholder?: string;

	//TODO: show multiple lines when either a) uui-select has the option to do so or b) combobox has popover issue fixed and use this instead of uui-select.
	@property({ type: Boolean })
	public multiple?: boolean;

	@query('uui-select')
	private selectEle!: HTMLInputElement;

	protected getFormElement() {
		return this.selectEle;
	}

	#onChange(e: UUISelectEvent) {
		e.stopPropagation();
		if (e.target.value) this.value = e.target.value;
		this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true }));
	}

	render() {
		if (!this.options) return nothing;
		return html`<uui-select
			label=${this.localize.term('formProviderFieldTypes_dropdownName')}
			.placeholder=${this.placeholder ?? ''}
			.options=${this.options}
			@change=${this.#onChange}></uui-select>`;
	}

	static styles = [
		css`
			:host {
				display: block;
			}
		`,
	];
}

export default UmbInputDropdownListElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-input-dropdown-list': UmbInputDropdownListElement;
	}
}