import api from "./axios.instance";

/**
 * Support API
 * -----------
 * Handles seller support & help requests
 */

/**
 * Submit support query / help request
 * @param {Object} data
 * @returns API Response
 *
 * Backend:
 * POST /api/support
 * body: { subject, message }
 */
export const createSupportTicketApi = (data) => {
  return api.post("/support", data);
};

/**
 * (Optional - future)
 * Get all support tickets of logged-in seller
 */
export const getMySupportTicketsApi = () => {
  return api.get("/support/my");
};
