import { prisma } from "../src/lib/prisma";

async function testMarquee() {
  try {
    console.log("Attempting to count marquees...");
    const count = await prisma.marquee.count();
    console.log("Marquee count:", count);
    
    console.log("Attempting to find first marquee...");
    const first = await prisma.marquee.findFirst();
    console.log("First marquee:", first);
  } catch (error) {
    console.error("Error accessing Marquee table:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testMarquee();
