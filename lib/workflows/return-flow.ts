import {
  createReturn,
  getOrder,
  notifyReturnInProcess,
  preauthorizeRefund,
} from "@/lib/api";

async function loadOrder(orderId: string) {
  "use step";
  return getOrder(orderId);
}

async function notifyCustomer(orderId: string) {
  "use step";
  return notifyReturnInProcess(orderId);
}

async function authorizeRefund(orderId: string) {
  "use step";
  return preauthorizeRefund(orderId);
}

async function fileReturn(
  orderId: string,
  items: { productId: string; quantity: number }[],
  reason: string,
) {
  "use step";
  return createReturn({ orderId, items, reason });
}

export async function returnFlow(orderId: string, reason: string) {
  "use workflow";

  const order = await loadOrder(orderId);
  await notifyCustomer(orderId);
  await authorizeRefund(orderId);
  return fileReturn(
    order.id,
    order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    reason,
  );
}
