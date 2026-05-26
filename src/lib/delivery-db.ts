import { prisma } from "./prisma";
import { normalize } from "./delivery";

export async function lookupDeliveryFee({
  state,
  city,
}: {
  state: string;
  city?: string;
}): Promise<number | null> {
  const normalizedState = normalize(state);

  const deliveryState = await prisma.deliveryState.findFirst({
    where: {
      name: { equals: normalizedState, mode: "insensitive" as const },
    },
  });

  if (!deliveryState) return null;

  if (city) {
    const normalizedCity = normalize(city);
    const deliveryCity = await prisma.deliveryCity.findFirst({
      where: {
        deliveryStateId: deliveryState.id,
        name: { equals: normalizedCity, mode: "insensitive" as const },
      },
    });

    if (deliveryCity?.overrideFee != null) {
      return deliveryCity.overrideFee;
    }
  }

  return deliveryState.defaultFee;
}

export async function getDeliveryStates() {
  return prisma.deliveryState.findMany({
    include: { cities: true },
    orderBy: { name: "asc" },
  });
}

export async function getDeliveryCities(stateName: string) {
  const normalizedState = normalize(stateName);
  const deliveryState = await prisma.deliveryState.findFirst({
    where: {
      name: { equals: normalizedState, mode: "insensitive" as const },
    },
  });

  if (!deliveryState) return [];

  return prisma.deliveryCity.findMany({
    where: { deliveryStateId: deliveryState.id },
    orderBy: { name: "asc" },
  });
}
