# Copyright 2024 Tecnativa - Carlos Lopez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from urllib.parse import quote

from odoo.tests import tagged
from odoo.tests.common import HttpCase


@tagged("post_install", "-at_install")
class TestWebTimeline(HttpCase):
    def _run_hoot(self, test_filter):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&timeout=15000"
            f"&filter={quote(chr(34) + test_filter + chr(34))}",
            "",
            "",
            login="admin",
            timeout=1800,
            success_signal="[HOOT] Test suite succeeded",
            error_checker=lambda x: "[HOOT]" not in x,
        )

    def test_timeline_arch(self):
        self._run_hoot("TimelineView - ArchParser")

    def test_timeline_view(self):
        self._run_hoot("TimelineView - View")
