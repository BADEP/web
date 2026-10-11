import {
  TimelineArchParser,
  TimelineParseArchError,
} from "@web_timeline/views/timeline/timeline_arch_parser.esm";
import {FAKE_ORDER_FIELDS} from "./helpers.esm";
import {describe, expect, test} from "@odoo/hoot";
import {allowTranslations} from "@web/../tests/web_test_helpers";
import {parseXML} from "@web/core/utils/xml";

function parseArch(arch) {
  const parser = new TimelineArchParser();
  const xmlDoc = parseXML(arch);
  return parser.parse(xmlDoc, FAKE_ORDER_FIELDS);
}

function check(paramName, paramValue, expectedName, expectedValue) {
  const arch = `<timeline date_start="start_date" default_group_by="partner_id" ${paramName}="${paramValue}" />`;
  const data = parseArch(arch);
  expect(data[expectedName]).toBe(expectedValue);
}

describe.current.tags("desktop");

describe("TimelineView - ArchParser", () => {
  test("throw if date_start is not set", () => {
    allowTranslations();
    expect(() => parseArch(`<timeline default_group_by="partner_id"/>`)).toThrow(
      TimelineParseArchError
    );
  });

  test("throw if default_group_by is not set", () => {
    allowTranslations();
    expect(() => parseArch(`<timeline date_start="date_start"/>`)).toThrow(
      TimelineParseArchError
    );
  });

  test("hasEditDialog", () => {
    check("event_open_popup", "", "open_popup_action", false);
    check("event_open_popup", "true", "open_popup_action", true);
    check("event_open_popup", "True", "open_popup_action", true);
    check("event_open_popup", "1", "open_popup_action", true);
    check("event_open_popup", "false", "open_popup_action", false);
    check("event_open_popup", "False", "open_popup_action", false);
    check("event_open_popup", "0", "open_popup_action", false);
  });

  test("create", () => {
    check("create", "", "canCreate", true);
    check("create", "true", "canCreate", true);
    check("create", "True", "canCreate", true);
    check("create", "1", "canCreate", true);
    check("create", "false", "canCreate", false);
    check("create", "False", "canCreate", false);
    check("create", "0", "canCreate", false);
    check("create", "12", "canCreate", true);
  });

  test("edit", () => {
    check("edit", "", "canUpdate", true);
    check("edit", "true", "canUpdate", true);
    check("edit", "True", "canUpdate", true);
    check("edit", "1", "canUpdate", true);
    check("edit", "false", "canUpdate", false);
    check("edit", "False", "canUpdate", false);
    check("edit", "0", "canUpdate", false);
    check("edit", "12", "canUpdate", true);
  });

  test("delete", () => {
    check("delete", "", "canDelete", true);
    check("delete", "true", "canDelete", true);
    check("delete", "True", "canDelete", true);
    check("delete", "1", "canDelete", true);
    check("delete", "false", "canDelete", false);
    check("delete", "False", "canDelete", false);
    check("delete", "0", "canDelete", false);
    check("delete", "12", "canDelete", true);
  });

  test("mode", () => {
    check("mode", "day", "mode", "day");
    check("mode", "week", "mode", "week");
    check("mode", "month", "mode", "month");
    expect(() =>
      parseArch(
        `<timeline date_start="start_date" default_group_by="partner_id" mode="other" />`
      )
    ).toThrow(TimelineParseArchError);

    expect(() =>
      parseArch(
        `<timeline date_start="start_date" default_group_by="partner_id" mode="" />`
      )
    ).toThrow(TimelineParseArchError);
  });

  test("colors", () => {
    const archInfo = parseArch(`
            <timeline date_start="start_date" default_group_by="partner_id" colors="gray: state == 'cancel'; #ec7063: state == 'done'"/>
        `);
    expect(archInfo.colors.length).toBe(2);
    expect(archInfo.colors[0].field).toBe("state");
    expect(archInfo.colors[0].color).toBe("gray");
    expect(archInfo.colors[0].ast.left.value).toBe("state");
    expect(archInfo.colors[0].ast.op).toBe("==");
    expect(archInfo.colors[0].ast.right.value).toBe("cancel");
    expect(archInfo.fieldNames.includes("state")).toBe(true);
  });

  test("templates", () => {
    const archInfo = parseArch(`
            <timeline date_start="start_date" default_group_by="partner_id">
                <field name="other_field" />
                <templates>
                    <t t-name="timeline-item">
                        <span t-out="record.other_field" />
                    </t>
                </templates>
            </timeline>
        `);
    expect(archInfo.templateDocs.hasOwnProperty("timeline-item")).toBe(true);
    expect(archInfo.fieldNames.includes("other_field")).toBe(true);
  });
});
