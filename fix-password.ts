import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "lincoztech@gmail.com";
  const password = "Lincoz@Tech-2";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
    create: {
      email,
      name: "Lincoz Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("User updated successfully:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
