import "dotenv/config";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Organization from "../models/organization/Organization";
import OrganizationMember from "../models/organization/OrganizationMember";
import Board from "../models/board/Board";
import List from "../models/board/List";
import Card from "../models/card/Card";
import Activity from "../models/activity/Activity";
import Invite from "../models/organization/Invite";
import { auth } from "@/lib/auth/auth";

const MONGODB_URI = process.env.MONGODB_URI!

interface SeedUser {
  id: string;
  name: string;
  email: string;
}

async function seed() {
  console.log("Connecting to Database...");
  console.log("MONGODB_URI", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("connected to database");
  await Organization.deleteMany({});
  await OrganizationMember.deleteMany({});
  await Board.deleteMany({});
  await List.deleteMany({});
  await Card.deleteMany({});
  await Activity.deleteMany({});
  await Invite.deleteMany({});
  console.log("Cleaned old data.");

  const users: SeedUser[] = [];
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB connection not ready");
  await db.collection("user").deleteMany({});

  const DEFAULT_PASSWORD = "Password@123";

for (let i = 0; i < 12; i++) {
  const name = faker.person.fullName();
  const email = faker.internet.email().toLowerCase();
  const image = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(
    name
  )}`;

  await auth.api.signUpEmail({
    body: {
      name,
      email,
      password: DEFAULT_PASSWORD,
      image,
    },
  });

  const user = await db.collection("user").findOne({ email });

  if (!user) {
    throw new Error(`Failed to create user ${email}`);
  }

  users.push({
    id: user._id.toString(),
    name,
    email,
  });
}

console.log(`Created ${users.length} users.`);
console.log(`Default password: ${DEFAULT_PASSWORD}`);

  const orgsData = [
    { name: "Acme Kanban Corp", slug: "acme-kanban" },
    { name: "Global Tech Inc", slug: "global-tech" },
    { name: "Alpha Dev Studio", slug: "alpha-devs" },
  ];

  const orgs: Array<{ _id: mongoose.Types.ObjectId }> = [];
  for (const o of orgsData) {
    const org = await Organization.create({ name: o.name, slug: o.slug, createdBy: users[0].id });
    orgs.push(org);

    for (let i = 0; i < users.length; i++) {
      let role = "member";
      if (i === 0) role = "owner";
      else if (i <= 2) role = "admin";
      else if (i === users.length - 1) role = "viewer";

      await OrganizationMember.create({
        organizationId: org._id,
        userId: new mongoose.Types.ObjectId(users[i].id),
        role,
      });
    }
  }
  console.log(`Created ${orgs.length} organizations.`);

  const boards: Array<{ _id: mongoose.Types.ObjectId }> = [];
  const boardNames = ["Project Alpha", "Marketing Campaigns", "HR Recruitment", "Software Release v2", "Client Redesign"];
  for (let i = 0; i < boardNames.length; i++) {
    const board = await Board.create({
      organizationId: orgs[i % orgs.length]._id,
      name: boardNames[i],
      createdBy: users[0].id,
    });
    boards.push(board);
  }
  console.log(`Created ${boards.length} boards.`);

  const lists: Array<{ _id: mongoose.Types.ObjectId }> = [];
  const columnTitles = ["To Do", "In Progress", "Code Review", "Done"];
  for (const board of boards) {
    for (let idx = 0; idx < columnTitles.length; idx++) {
      const list = await List.create({
        boardId: board._id,
        name: columnTitles[idx],
        position: (idx + 1) * 1000,
      });
      lists.push(list);
    }
  }
  console.log(`Created ${lists.length} lists.`);

  for (let i = 0; i < 220; i++) {
    const list = faker.helpers.arrayElement(lists);
    await Card.create({
      listId: list._id,
      title: faker.hacker.phrase(),
      description: faker.lorem.paragraph(),
      assigneeId: faker.helpers.arrayElement(users).id,
      dueDate: faker.date.between({ from: "2026-08-01", to: "2026-08-30" }),
      position: (i + 1) * 1000,
      createdBy: users[0].id,
    });
  }
  console.log("Created 220 cards.");

  const activityTypes = ["BOARD_CREATED", "LIST_CREATED", "CARD_CREATED", "CARD_MOVED", "COMMENT_ADDED"] as const;
  for (let i = 0; i < 510; i++) {
    await Activity.create({
      organizationId: faker.helpers.arrayElement(orgs)._id,
      actorId: faker.helpers.arrayElement(users).id,
      type: faker.helpers.arrayElement(activityTypes),
      message: `performed operation in workspace`,
      createdAt: faker.date.recent({ days: 30 }),
    });
  }
  console.log("Logged 510 activity rows.");

  const validExpires = new Date();
  validExpires.setDate(validExpires.getDate() + 7);
  await Invite.create({
    organizationId: orgs[0]._id, email: "join-active@example.com",
    token: "valid-token-1234", role: "member",
    invitedBy: users[0].id, expiresAt: validExpires,
  });

  const expiredExpires = new Date();
  expiredExpires.setDate(expiredExpires.getDate() - 1);
  await Invite.create({
    organizationId: orgs[0]._id, email: "join-expired@example.com",
    token: "expired-token-5678", role: "member",
    invitedBy: users[0].id, expiresAt: expiredExpires,
  });

  console.log("Created 2 invite tokens.");
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});