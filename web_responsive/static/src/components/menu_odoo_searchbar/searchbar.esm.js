/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {Component, proxy, signal} from "@odoo/owl";
import {useAutofocus, useService} from "@web/core/utils/hooks";

/**
 * @extends Component
 */
export class AppsMenuOdooSearchBar extends Component {
  static template = "web_responsive.AppsMenuOdooSearchBar";
  searchBarInputRef = signal.ref();

  setup() {
    super.setup();
    this.state = proxy({
      rootItems: [],
      subItems: [],
      offset: 0,
      hasResults: false,
    });
    useAutofocus({ref: this.searchBarInputRef});
    this.command = useService("command");
  }

  /**
   * @returns {String}
   */
  get inputValue() {
    const el = this.searchBarInputRef();
    return el ? el.value : "";
  }

  set inputValue(value) {
    const el = this.searchBarInputRef();
    if (el) {
      el.value = value;
    }
  }

  _onSearchInput() {
    if (this.inputValue) {
      this._openSearchMenu(this.inputValue);
      this.inputValue = "";
    }
  }

  _onSearchClick() {
    this._openSearchMenu();
  }

  /**
   * @param {String} [value]
   * @private
   */
  _openSearchMenu(value) {
    const searchValue = value ? `/${value}` : "/";
    this.command.openMainPalette({searchValue}, null);
  }
}
