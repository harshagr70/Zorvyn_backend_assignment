const dashboardService = require("../../src/modules/dashboard/dashboard.service");
const { createUser } = require("../fixtures/users");
const { createRecord } = require("../fixtures/records");

describe("Dashboard service", () => {
  it("computes summary from records", async () => {
    const { user } = await createUser("analyst");
    await createRecord({ createdBy: user._id, updatedBy: user._id, type: "income", amount: 1000 });
    await createRecord({
      createdBy: user._id,
      updatedBy: user._id,
      type: "expense",
      amount: 300,
      category: "food",
    });

    const summary = await dashboardService.getSummary();
    expect(summary.totalIncome).toBe(1000);
    expect(summary.totalExpenses).toBe(300);
    expect(summary.netBalance).toBe(700);
  });
});
