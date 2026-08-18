import "dotenv/config";
import { faker } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

const DEFAULT_PASSWORD = "Password@123";

async function seed() {
  console.log("🌱 Connecting to Neon PostgreSQL and cleaning existing data...");

  // Clean tables in reverse relation order
  await prisma.activity.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.list.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned old database records.");

  // 1. Create 12 Users via Better-Auth
  console.log("👥 Creating 12 users...");
  for (let i = 0; i < 12; i++) {
    const name = faker.person.fullName();
    const email = `user${i + 1}@example.com`;
    const image = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;

    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password: DEFAULT_PASSWORD,
        image,
      },
    });
  }

  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  console.log(`✅ Created ${users.length} users (Password: ${DEFAULT_PASSWORD}).`);

  // 2. Create Organizations and Memberships
  console.log("🏢 Creating organizations and assigning roles...");
  const orgsData = [
    { name: "Acme Kanban Corp", slug: "acme-kanban" },
    { name: "Global Tech Inc", slug: "global-tech" },
    { name: "Alpha Dev Studio", slug: "alpha-devs" },
  ];

  const orgs = [];
  for (const o of orgsData) {
    const org = await prisma.organization.create({
      data: {
        name: o.name,
        slug: o.slug,
      },
    });
    orgs.push(org);

    for (let i = 0; i < users.length; i++) {
      let role = "member";
      if (i === 0) role = "owner";
      else if (i <= 2) role = "admin";
      else if (i === users.length - 1) role = "viewer";

      await prisma.member.create({
        data: {
          organizationId: org.id,
          userId: users[i].id,
          role,
        },
      });
    }
  }
  console.log(`✅ Created ${orgs.length} organizations.`);

  // 3. Create Boards
  console.log("📋 Creating boards...");
  const boards = [];
  const boardNames = [
    "Project Alpha",
    "Marketing Campaigns",
    "HR Recruitment",
    "Software Release v2",
    "Client Redesign",
  ];

  for (let i = 0; i < boardNames.length; i++) {
    const board = await prisma.board.create({
      data: {
        organizationId: orgs[i % orgs.length].id,
        name: boardNames[i],
      },
    });
    boards.push(board);
  }
  console.log(`✅ Created ${boards.length} boards.`);

  // 4. Create Lists
  console.log("📑 Creating column lists...");
  const lists = [];
  const columnTitles = ["To Do", "In Progress", "Code Review", "Done"];

  for (const board of boards) {
    for (let idx = 0; idx < columnTitles.length; idx++) {
      const list = await prisma.list.create({
        data: {
          boardId: board.id,
          name: columnTitles[idx],
          position: (idx + 1) * 1000,
        },
      });
      lists.push(list);
    }
  }
  console.log(`✅ Created ${lists.length} lists.`);

  // 5. Create Cards
  console.log("🃏 Creating 200+ cards...");
  for (let i = 0; i < 220; i++) {
    const list = faker.helpers.arrayElement(lists);
    await prisma.card.create({
      data: {
        listId: list.id,
        title: faker.hacker.phrase(),
        description: faker.lorem.paragraph(),
        assigneeId: faker.helpers.arrayElement(users).id,
        dueDate: faker.date.between({ from: "2026-08-01", to: "2026-08-30" }),
        position: (i + 1) * 1000,
        createdBy: users[0].id,
      },
    });
  }
  console.log("✅ Created 220 cards.");

  // 6. Create Activity Logs
  console.log("📝 Generating 500+ activity logs...");
  const activityTypes = [
    "BOARD_CREATED",
    "LIST_CREATED",
    "CARD_CREATED",
    "CARD_MOVED",
    "COMMENT_ADDED",
  ] as const;

  const activityData = [];
  for (let i = 0; i < 510; i++) {
    activityData.push({
      organizationId: faker.helpers.arrayElement(orgs).id,
      actorId: faker.helpers.arrayElement(users).id,
      type: faker.helpers.arrayElement(activityTypes),
      message: "performed operation in workspace",
      createdAt: faker.date.recent({ days: 30 }),
    });
  }
  await prisma.activity.createMany({ data: activityData });
  console.log("✅ Logged 510 activity rows.");

  // 7. Create Sample Invitations
  const validExpires = new Date();
  validExpires.setDate(validExpires.getDate() + 7);

  await prisma.invitation.create({
    data: {
      id: "valid-token-1234",
      organizationId: orgs[0].id,
      email: "join-active@example.com",
      role: "member",
      status: "pending",
      inviterId: users[0].id,
      expiresAt: validExpires,
    },
  });

  const expiredExpires = new Date();
  expiredExpires.setDate(expiredExpires.getDate() - 1);

  await prisma.invitation.create({
    data: {
      id: "expired-token-5678",
      organizationId: orgs[0].id,
      email: "join-expired@example.com",
      role: "member",
      status: "pending",
      inviterId: users[0].id,
      expiresAt: expiredExpires,
    },
  });

  console.log("✅ Created sample invite tokens.");
  console.log("\n🎉 Database seeded successfully with mock data!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
