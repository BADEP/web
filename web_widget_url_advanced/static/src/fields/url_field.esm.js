/* Copyright 2018 Simone Orsi - Camptocamp SA
License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html). */

import {UrlField, formUrlField, urlField} from "@web/views/fields/url/url_field";
import {
  copyClipboardFieldProps,
  copyClipboardURLField,
} from "@web/views/fields/copy_clipboard/copy_clipboard_field";
import {patch} from "@web/core/utils/patch";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {t, useProps} from "@odoo/owl";

const AdvancedUrlFieldProps = {
  text_field: t.string().optional(),
  prefix_name: t.string().optional(),
};

// CopyClipboardURLField forwards its own props to the UrlField
Object.assign(copyClipboardFieldProps, AdvancedUrlFieldProps);

patch(UrlField.prototype, {
  setup() {
    // The UrlField props schema is not exported in Odoo 20: declare it again
    // with the extra props so they are exposed on this.props.
    this.props = useProps({
      ...standardFieldProps,
      placeholder: t.string().optional(),
      text: t.string().optional(),
      websitePath: t.boolean().optional(),
      ...AdvancedUrlFieldProps,
    });
    super.setup(...arguments);
  },

  _get_text_field() {
    if (this.props.text_field) {
      let field_value = this.props.record.data[this.props.text_field];
      if (Array.isArray(field_value) && field_value.length === 2) {
        field_value = field_value[1];
      }
      return field_value;
    }
    return false;
  },

  get title() {
    return (
      this._get_text_field() ||
      this.props.text ||
      this.props.record.data[this.props.name] ||
      ""
    );
  },

  get formattedHrefWithPrefix() {
    let value = this.formattedHref;

    if (this.props.prefix_name) {
      value = this.props.prefix_name + ":" + value;
    }

    return value;
  },
});

const patchExtractProps = () => ({
  extractProps({attrs, options}) {
    const props = super.extractProps(...arguments);
    props.text_field = attrs.text_field || options.text_field;
    props.prefix_name = attrs.prefix_name || options.prefix_name;
    return props;
  },
});

patch(urlField, patchExtractProps());
patch(formUrlField, patchExtractProps());
patch(copyClipboardURLField, patchExtractProps());
