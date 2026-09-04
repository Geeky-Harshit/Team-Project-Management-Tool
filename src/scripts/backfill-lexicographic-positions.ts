import "dotenv/config";
import {
  generateNKeysBetween,
  sortByPosition,
} from "@/lib/lexicographic-position";
import { prisma } from "@/lib/prisma";

function sortExisting<T extends { position: string }>(items: T[]): T[] {
  const allNumeric = items.every((item) => /^-?\d+$/.test(item.position));
  if (allNumeric) {
    return [...items].sort((a, b) => Number(a.position) - Number(b.position));
  }
  return sortByPosition(items);
}

async function backfill() {
  const boards = await prisma.board.findMany({
    select: { id: true },
  });

  for (const board of boards) {
    const lists = await prisma.list.findMany({
      where: { boardId: board.id },
      select: { id: true, position: true },
    });
    const orderedLists = sortExisting(lists);
    const listKeys = generateNKeysBetween(null, null, orderedLists.length);

    for (let i = 0; i < orderedLists.length; i++) {
      await prisma.list.update({
        where: { id: orderedLists[i]!.id },
        data: { position: listKeys[i]! },
      });
    }

    for (const list of orderedLists) {
      const cards = await prisma.card.findMany({
        where: { listId: list.id },
        select: { id: true, position: true },
      });
      const orderedCards = sortExisting(cards);
      const cardKeys = generateNKeysBetween(null, null, orderedCards.length);

      for (let i = 0; i < orderedCards.length; i++) {
        await prisma.card.update({
          where: { id: orderedCards[i]!.id },
          data: { position: cardKeys[i]! },
        });
      }
    }
  }

  console.log(
    `Backfilled lexicographic positions for ${boards.length} board(s).`,
  );
}

backfill()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
