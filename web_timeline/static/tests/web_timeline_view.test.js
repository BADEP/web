import {
  contains,
  defineModels,
  fields,
  models,
  mountView,
  onRpc,
  preloadBundle,
} from "@web/../tests/web_test_helpers";
import {animationFrame, describe, expect, runAllTimers, test} from "@odoo/hoot";
import {queryAll} from "@odoo/hoot-dom";

describe.current.tags("desktop");

class Partner extends models.Model {
  name = fields.Char({string: "Name"});

  _records = [
    {id: 1, name: "Partner 1"},
    {id: 2, name: "Partner 2"},
    {id: 3, name: "Partner 3"},
  ];
}

class Order extends models.Model {
  name = fields.Char({string: "Name"});
  date_start = fields.Date({string: "Date start"});
  date_end = fields.Date({string: "Date end"});
  partner_id = fields.Many2one({string: "Partner", relation: "partner"});

  _records = [
    {
      id: 1,
      name: "Record 1",
      date_start: "2024-01-01",
      date_end: "2024-01-02",
      partner_id: 1,
    },
    {
      id: 2,
      name: "Record 2",
      date_start: "2024-01-03",
      date_end: "2024-02-05",
      partner_id: 1,
    },
    {
      id: 3,
      name: "Record 3",
      date_start: "2024-01-10",
      date_end: "2024-01-15",
      partner_id: 2,
    },
    {
      id: 4,
      name: "Record 4",
      date_start: "2024-01-15",
      date_end: "2024-02-01",
      partner_id: 3,
    },
  ];
}

defineModels([Partner, Order]);
preloadBundle("web_timeline.vis-timeline_lib");

const BUTTONS = ["today", "scale_day", "scale_week", "scale_month", "scale_year"];

function checkActiveButton(active) {
  for (const button of BUTTONS) {
    const selector = `.oe_timeline_button_${button}`;
    if (button === active) {
      expect(selector).toHaveClass("btn-primary");
    } else {
      expect(selector).not.toHaveClass("btn-primary");
    }
  }
}

async function mountTimeline(extraAttrs = "") {
  onRpc("has_access", () => true);
  await mountView({
    type: "timeline",
    resModel: "order",
    arch: `<timeline date_start="date_start" date_stop="date_end" default_group_by="partner_id" ${extraAttrs}/>`,
  });
  // Vis-timeline redraws asynchronously (timers are mocked by Hoot)
  await runAllTimers();
  await animationFrame();
}

function getItemContent(name) {
  const items = queryAll(".vis-item-content").filter((el) =>
    el.textContent.includes(name)
  );
  expect(items).toHaveLength(1);
  return items[0];
}

describe("TimelineView - View", () => {
  test("Test basic timeline view", async () => {
    await mountTimeline();
    expect(".oe_timeline_view").toHaveCount(1);
  });

  test("click today slot", async () => {
    await mountTimeline();
    await contains(".oe_timeline_button_today").click();
    checkActiveButton("today");
  });

  test("click month slot", async () => {
    await mountTimeline();
    await contains(".oe_timeline_button_scale_month").click();
    checkActiveButton("scale_month");
  });

  test("Check button delete", async () => {
    await mountTimeline();
    const item = getItemContent("Record 2");
    await contains(item).click();
    await runAllTimers();
    expect(item.closest(".vis-item").querySelector(".vis-delete")).not.toBe(null);
  });

  test("Check button delete disabled", async () => {
    await mountTimeline('delete="0"');
    const item = getItemContent("Record 2");
    await contains(item).click();
    await runAllTimers();
    expect(item.closest(".vis-item").querySelector(".vis-delete")).toBe(null);
  });
});
