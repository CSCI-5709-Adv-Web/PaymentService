import { logger } from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

// Get the order service URL from environment variables
const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://order-service";

/**
 * Updates the order status after a successful payment
 * @param orderId The ID of the order to update
 * @param token Authentication token for the order service
 * @returns Response from the order service
 */
export const updateOrderStatus = async (
  orderId: string,
  token: string
): Promise<any> => {
  try {
    logger.info(
      `Updating order status for order ${orderId} to PAYMENT RECEIVED`
    );

    const response = await fetch(`${ORDER_SERVICE_URL}/updateStatus`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId,
        status: "PAYMENT RECEIVED",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error(
        `Failed to update order status: ${JSON.stringify(errorData)}`
      );
      throw new Error(
        `Order status update failed with status ${response.status}`
      );
    }

    const data = await response.json();
    logger.info(`Successfully updated order status for order ${orderId}`);
    return data;
  } catch (error) {
    logger.error(`Error updating order status: ${error}`);
    throw error;
  }
};
