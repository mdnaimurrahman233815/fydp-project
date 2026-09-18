import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
import { db } from "@/db";
import {
  actionLogs,
  groupMembers,
  groups,
  joinRequests,
  messages,
  projects,
  students,
  teachers,
} from "@/db/schema";
import { DEMO_PASSWORD } from "./constants";

let seedingPromise: Promise<void> | null = null;

export function ensureSeeded() {
  if (!seedingPromise) {
    seedingPromise = seedIfEmpty().catch((error) => {
      seedingPromise = null;
      throw error;
    });
  }
  return seedingPromise;
}

async function seedIfEmpty() {
  const [existing] = await db.select({ total: count() }).from(students);
  if ((existing?.total ?? 0) > 0) return;
  await seedDatabase();
}

export async function seedDatabase() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await db.transaction(async (tx) => {
  const teacherRows = await tx
    .insert(teachers)
    .values([
      {
        fullName: "Dr. Ayesha Khan",
        email: "admin@university.edu",
        passwordHash,
        department: "Computer Science",
        role: "admin",
      },
      {
        fullName: "Dr. Imran Malik",
        email: "imran.malik@university.edu",
        passwordHash,
        department: "Computer Science",
        role: "teacher",
      },
      {
        fullName: "Dr. Sara Ahmed",
        email: "sara.ahmed@university.edu",
        passwordHash,
        department: "Software Engineering",
        role: "teacher",
      },
      {
        fullName: "Prof. Bilal Hussain",
        email: "bilal.hussain@university.edu",
        passwordHash,
        department: "Electrical Engineering",
        role: "teacher",
      },
      {
        fullName: "Dr. Nadia Qureshi",
        email: "nadia.qureshi@university.edu",
        passwordHash,
        department: "Mechanical Engineering",
        role: "teacher",
      },
    ])
    .returning();

  const studentRows = await tx
    .insert(students)
    .values([
      { fullName: "Ali Raza", email: "ali.raza@student.edu", rollNumber: "CS-2022-001", passwordHash, department: "Computer Science" },
      { fullName: "Fatima Noor", email: "fatima.noor@student.edu", rollNumber: "CS-2022-002", passwordHash, department: "Computer Science" },
      { fullName: "Hassan Ali", email: "hassan.ali@student.edu", rollNumber: "CS-2022-003", passwordHash, department: "Computer Science" },
      { fullName: "Zainab Shah", email: "zainab.shah@student.edu", rollNumber: "SE-2022-004", passwordHash, department: "Software Engineering" },
      { fullName: "Omar Farooq", email: "omar.farooq@student.edu", rollNumber: "SE-2022-005", passwordHash, department: "Software Engineering" },
      { fullName: "Amina Tariq", email: "amina.tariq@student.edu", rollNumber: "CS-2022-006", passwordHash, department: "Computer Science" },
      { fullName: "Usman Khalid", email: "usman.khalid@student.edu", rollNumber: "EE-2022-007", passwordHash, department: "Electrical Engineering" },
      { fullName: "Hira Saeed", email: "hira.saeed@student.edu", rollNumber: "SE-2022-008", passwordHash, department: "Software Engineering" },
      { fullName: "Danish Iqbal", email: "danish.iqbal@student.edu", rollNumber: "CS-2022-009", passwordHash, department: "Computer Science" },
      { fullName: "Mehwish Rauf", email: "mehwish.rauf@student.edu", rollNumber: "SE-2022-010", passwordHash, department: "Software Engineering" },
      { fullName: "Saad Anwar", email: "saad.anwar@student.edu", rollNumber: "CS-2022-011", passwordHash, department: "Computer Science" },
      { fullName: "Laiba Khan", email: "laiba.khan@student.edu", rollNumber: "EE-2022-012", passwordHash, department: "Electrical Engineering" },
      { fullName: "Taha Javed", email: "taha.javed@student.edu", rollNumber: "CS-2022-013", passwordHash, department: "Computer Science" },
      { fullName: "Noor Fatima", email: "noor.fatima@student.edu", rollNumber: "SE-2022-014", passwordHash, department: "Software Engineering" },
      { fullName: "Hamza Sheikh", email: "hamza.sheikh@student.edu", rollNumber: "CS-2022-015", passwordHash, department: "Computer Science" },
    ])
    .returning();

  const byRoll = Object.fromEntries(studentRows.map((row) => [row.rollNumber, row]));
  const byEmail = Object.fromEntries(teacherRows.map((row) => [row.email, row]));

  const admin = byEmail["admin@university.edu"];
  const imran = byEmail["imran.malik@university.edu"];
  const sara = byEmail["sara.ahmed@university.edu"];
  const bilal = byEmail["bilal.hussain@university.edu"];

  const ali = byRoll["CS-2022-001"];
  const fatima = byRoll["CS-2022-002"];
  const hassan = byRoll["CS-2022-003"];
  const zainab = byRoll["SE-2022-004"];
  const omar = byRoll["SE-2022-005"];
  const amina = byRoll["CS-2022-006"];
  const usman = byRoll["EE-2022-007"];
  const hira = byRoll["SE-2022-008"];
  const danish = byRoll["CS-2022-009"];
  const mehwish = byRoll["SE-2022-010"];
  const saad = byRoll["CS-2022-011"];
  const laiba = byRoll["EE-2022-012"];
  const taha = byRoll["CS-2022-013"];
  const noor = byRoll["SE-2022-014"];
  const hamza = byRoll["CS-2022-015"];

  if (!admin || !imran || !sara || !bilal || !ali || !fatima || !hassan || !zainab || !omar || !amina || !usman || !hira || !danish || !mehwish || !saad || !laiba || !taha || !noor || !hamza) {
    throw new Error("Seed lookup failed");
  }

  const [alpha] = await tx
    .insert(groups)
    .values({
      name: "Team Alpha",
      description: "Building a smart campus IoT platform for energy monitoring.",
      leaderStudentId: ali.id,
      isActive: true,
    })
    .returning();

  const [beta] = await tx
    .insert(groups)
    .values({
      name: "Team Beta",
      description: "Computer vision attendance system for lecture halls.",
      leaderStudentId: zainab.id,
      isActive: true,
    })
    .returning();

  const [gamma] = await tx
    .insert(groups)
    .values({
      name: "Team Gamma",
      description: "Looking for members interested in embedded systems and health tech.",
      leaderStudentId: amina.id,
      isActive: true,
    })
    .returning();

  const [delta] = await tx
    .insert(groups)
    .values({
      name: "Team Delta",
      description: "Full group working on a secure academic records blockchain prototype.",
      leaderStudentId: mehwish.id,
      isActive: true,
    })
    .returning();

  if (!alpha || !beta || !gamma || !delta) {
    throw new Error("Group seed failed");
  }

  await tx.insert(groupMembers).values([
    { groupId: alpha.id, studentId: ali.id },
    { groupId: alpha.id, studentId: fatima.id },
    { groupId: alpha.id, studentId: hassan.id },
    { groupId: beta.id, studentId: zainab.id },
    { groupId: beta.id, studentId: omar.id },
    { groupId: gamma.id, studentId: amina.id },
    { groupId: delta.id, studentId: mehwish.id },
    { groupId: delta.id, studentId: saad.id },
    { groupId: delta.id, studentId: laiba.id },
    { groupId: delta.id, studentId: taha.id },
    { groupId: delta.id, studentId: noor.id },
    { groupId: delta.id, studentId: hamza.id },
  ]);

  await tx.insert(projects).values([
    {
      groupId: alpha.id,
      title: "Smart Campus Energy Monitor",
      description: "IoT sensors and a dashboard that tracks electricity usage across campus buildings.",
      supervisorTeacherId: imran.id,
    },
    {
      groupId: beta.id,
      title: "Vision-Based Attendance",
      description: "Face recognition attendance with privacy-preserving storage.",
      supervisorTeacherId: sara.id,
    },
    {
      groupId: gamma.id,
      title: "Wearable Fall Detection",
      description: "Prototype wearable for elderly fall detection. Supervisor to be assigned.",
      supervisorTeacherId: null,
    },
    {
      groupId: delta.id,
      title: "Academic Records Ledger",
      description: "Permissioned ledger for transcripts and degree verification.",
      supervisorTeacherId: bilal.id,
    },
  ]);

  await tx.insert(joinRequests).values([
    {
      groupId: alpha.id,
      studentId: usman.id,
      status: "PENDING",
      note: "I can help with hardware and sensor calibration.",
    },
    {
      groupId: beta.id,
      studentId: hira.id,
      status: "PENDING",
      note: "Strong in Python and OpenCV. Would love to join.",
    },
    {
      groupId: gamma.id,
      studentId: danish.id,
      status: "REJECTED",
      note: "Interested in embedded work.",
    },
  ]);

  await tx.insert(messages).values([
    {
      senderId: fatima.id,
      senderRole: "student",
      receiverId: ali.id,
      receiverRole: "student",
      content: "Ali, I uploaded the sensor wiring diagram. Can you review before Friday?",
      isRead: true,
    },
    {
      senderId: ali.id,
      senderRole: "student",
      receiverId: fatima.id,
      receiverRole: "student",
      content: "Looks good. Let's also add the power budget table.",
      isRead: false,
    },
    {
      senderId: ali.id,
      senderRole: "student",
      receiverId: imran.id,
      receiverRole: "teacher",
      content: "Dr. Malik, could we meet next week to confirm the IoT gateway choice?",
      isRead: false,
    },
    {
      senderId: imran.id,
      senderRole: "teacher",
      receiverId: ali.id,
      receiverRole: "student",
      content: "Yes — please share a one-page comparison of MQTT vs CoAP beforehand.",
      isRead: true,
    },
    {
      senderId: hira.id,
      senderRole: "student",
      receiverId: zainab.id,
      receiverRole: "student",
      content: "Hi Zainab, I sent a join request. Happy to demo a small face-detection prototype.",
      isRead: false,
    },
    {
      senderId: admin.id,
      senderRole: "teacher",
      receiverId: mehwish.id,
      receiverRole: "student",
      content: "Team Delta is marked FULL. Please keep your weekly logs updated.",
      isRead: false,
    },
  ]);

  await tx.insert(actionLogs).values([
    {
      actorId: admin.id,
      actorRole: "teacher",
      action: "seed",
      details: "Initial FYDP Hub demo data created.",
    },
  ]);
  });
}
