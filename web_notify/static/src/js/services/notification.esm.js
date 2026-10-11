import {NotificationSchema} from "@web/core/notifications/notification_plugin";
import {types as t} from "@odoo/owl";

// Odoo 20 validates notification options with an OWL type schema (used by the
// notification plugin resource and by the Notification component props).
// Extend its "type" selection with the "default" type used by notify_default.
// The options schema itself is not exported: reach it through the members of
// the exported NotificationSchema intersection.
const members =
  Object.getOwnPropertySymbols(NotificationSchema)
    .map((symbol) => NotificationSchema[symbol])
    .find(Array.isArray) || [];
for (const member of members) {
  const shape = typeof member.toShape === "function" ? member.toShape() : null;
  if (shape && !Array.isArray(shape) && "type" in shape) {
    shape.type = t
      .selection(["warning", "danger", "success", "info", "default"])
      .optional("warning");
  }
}
