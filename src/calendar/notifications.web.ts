export const calendarNotifications = {
  async permitted() {
    return false;
  },
  async request() {
    return false;
  },
  async cancel() {},
  async schedule(_suggestion: unknown) {},
};
