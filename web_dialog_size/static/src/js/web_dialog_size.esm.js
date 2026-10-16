import {Component, signal, t, useProps} from "@odoo/owl";
import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {Dialog} from "@web/core/dialog/dialog";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {browser} from "@web/core/browser/browser";

function triggerWindowResize() {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

export class ExpandButton extends Component {
  static template = "web_dialog_size.ExpandButton";
  props = useProps();

  setup() {
    this.original_size = this.props.getoriginalsize
      ? this.props.getoriginalsize()
      : this.props.getsize() !== "dialog_full_screen"
        ? this.props.getsize()
        : "md";
  }

  dialog_button_extend() {
    this.props.setsize("dialog_full_screen");
    browser.localStorage.setItem("odoo.web_dialog_size.value", "true");
    triggerWindowResize();
  }

  dialog_button_restore() {
    this.props.setsize(this.original_size);
    browser.localStorage.setItem("odoo.web_dialog_size.value", "false");
    triggerWindowResize();
  }
}

patch(Dialog.prototype, {
  setup() {
    this.originalSize = this.props.size;
    // Props are read-only in Owl 3: keep the size forced by this module in a
    // signal and give it precedence in the `size` getter.
    this.webDialogSizeForced = signal(undefined);
    super.setup();
    this.setSize = this.setSize.bind(this);
    this.getSize = this.getSize.bind(this);
    this.getOriginalSize = this.getOriginalSize.bind(this);

    const storedValue = browser.localStorage.getItem("odoo.web_dialog_size.value");
    const lastServerValue = browser.localStorage.getItem(
      "odoo.web_dialog_size.last_server_value"
    );

    if (storedValue === "true") {
      this.webDialogSizeForced.set("dialog_full_screen");
    }

    const orm = useService("orm");
    orm.call("ir.config_parameter", "get_web_dialog_size_config").then((r) => {
      const serverValue = String(Boolean(r.default_maximize));
      if (serverValue !== lastServerValue) {
        browser.localStorage.setItem(
          "odoo.web_dialog_size.last_server_value",
          serverValue
        );

        if (storedValue === null || storedValue === lastServerValue) {
          browser.localStorage.setItem("odoo.web_dialog_size.value", serverValue);
          if (serverValue === "true") {
            this.setSize("dialog_full_screen");
          } else if (this.webDialogSizeForced() === "dialog_full_screen") {
            this.setSize(this.originalSize || "md");
          }
        }
      }
    });
  },

  get size() {
    return this.webDialogSizeForced() || super.size;
  },

  setSize(size) {
    this.webDialogSizeForced.set(size);
  },

  getSize() {
    return this.size;
  },

  getOriginalSize() {
    return this.originalSize || "md";
  },
});

patch(SelectCreateDialog.prototype, {
  setup() {
    // SelectCreateDialog has no size prop in Odoo 20: keep the size of the
    // inner Dialog in a signal (undefined = Dialog default size).
    this.originalSize = undefined;
    this.webDialogSize = signal(undefined);
    super.setup();
    this.setSize = this.setSize.bind(this);
    this.getSize = this.getSize.bind(this);
    this.getOriginalSize = this.getOriginalSize.bind(this);

    const storedValue = browser.localStorage.getItem("odoo.web_dialog_size.value");
    const lastServerValue = browser.localStorage.getItem(
      "odoo.web_dialog_size.last_server_value"
    );

    if (storedValue === "true") {
      this.webDialogSize.set("dialog_full_screen");
    }

    const orm = useService("orm");
    orm.call("ir.config_parameter", "get_web_dialog_size_config").then((r) => {
      const serverValue = String(Boolean(r.default_maximize));
      if (serverValue !== lastServerValue) {
        browser.localStorage.setItem(
          "odoo.web_dialog_size.last_server_value",
          serverValue
        );
        if (storedValue === null || storedValue === lastServerValue) {
          browser.localStorage.setItem("odoo.web_dialog_size.value", serverValue);
          if (serverValue === "true") {
            this.setSize("dialog_full_screen");
          } else if (this.webDialogSize() === "dialog_full_screen") {
            this.setSize(this.originalSize || "md");
          }
        }
      }
    });
  },

  setSize(size) {
    this.webDialogSize.set(size);
  },

  getSize() {
    return this.webDialogSize();
  },

  getOriginalSize() {
    return this.originalSize || "md";
  },
});

Object.assign(ActionDialog.components, {ExpandButton});
SelectCreateDialog.components = Object.assign(SelectCreateDialog.components || {}, {
  ExpandButton,
});
Dialog.components = Object.assign(Dialog.components || {}, {ExpandButton});
// Keep Odoo's standard dialog sizes and add the custom maximized size.
Dialog.propsSchema.size = t
  .selection(["sm", "md", "lg", "xl", "fs", "fullscreen", "dialog_full_screen"])
  .optional("lg");
