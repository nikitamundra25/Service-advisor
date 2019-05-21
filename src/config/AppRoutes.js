export const AppRoutes = {
  HOME: {
    url: "/",
    name: "Dashboard",
    exact: true
  },
  DASHBOARD: {
    url: "/dashboard",
    name: "",
    exact: true
  },
  WORKFLOW: {
    url: "/workflow",
    name: "WorkFlow",
    exact: true
  },
  CALENDER: {
    url: "/calender",
    name: "Calender",
    exact: true
  },
  INVENTORY: {
    url: "/inventory",
    name: "Inventory",
    exact: false
  },
  INVENTORY_PARTS: {
    url: "/inventory/parts",
    name: "Parts",
    exact: true
  },
  INVENTORY_TIRES: {
    url: "/inventory/tires",
    name: "Tires",
    exact: true
  },
  INVENTORY_LABOURS: {
    url: "/inventory/labor",
    name: "Labor",
    exact: true
  },
  INVENTORY_VENDORS: {
    url: "/inventory/vendors",
    name: "Vendors",
    exact: true
  },
  INVENTORY_STATATICS: {
    url: "/inventory/statatics",
    name: "Statatics",
    exact: true
  },
  TIMESHEETS: {
    url: "/timesheets",
    name: "Time Clocks",
    exact: true
  },
  REPORTS: {
    url: "/reports",
    name: "Reports",
    exact: true
  },
  STAFF_MEMBERS: {
    url: "/settings/staff-members",
    name: "Staff Members",
    exact: true
  },
  VEHICLES: {
    url: "/vehicles",
    name: "Vehicles",
    exact: true
  },
  FLEETS: {
    url: "/settings/fleets",
    name: "Fleets",
    exact: true
  },
  CUSTOMERS: {
    url: "/customers",
    name: "Customers",
    exact: true
  },
  PRICEMATRIX: {
    url: "/settings/pricematrix",
    name: "Price Matrix",
    exact: true
  },
  SETTINGS: {
    url: "/settings",
    name: "Settings",
    exact: true
  }
};
