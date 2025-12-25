import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PrismaClient, CardStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

type AuthedRequest = express.Request & { userId?: string };

function auth(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({ data: { email, passwordHash } });
    return res.json({ id: user.id, email: user.email });
  } catch {
    return res.status(409).json({ error: "Email already in use" });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

app.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  return res.json({ id: user.id, email: user.email });
});

app.post("/auth/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.get("/me", auth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true },
  });
  res.json(user);
});

app.get("/cards", auth, async (req: AuthedRequest, res) => {
  const cards = await prisma.card.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });
  res.json(cards);
});

const createCardSchema = z.object({
  title: z.string().min(1).max(120),
  notes: z.string().max(2000).optional(),
  tag: z.string().max(40).optional(),
});

app.post("/cards", auth, async (req: AuthedRequest, res) => {
  const parsed = createCardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const card = await prisma.card.create({
    data: {
      userId: req.userId!,
      title: parsed.data.title,
      notes: parsed.data.notes,
      tag: parsed.data.tag,
      status: CardStatus.INBOX,
    },
  });
  res.json(card);
});

const updateCardSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  notes: z.string().max(2000).nullable().optional(),
  tag: z.string().max(40).nullable().optional(),
  status: z.enum(["INBOX", "TODAY", "WAITING", "DONE"]).optional(),
});

app.patch("/cards/:id", auth, async (req: AuthedRequest, res) => {
  const parsed = updateCardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const cardId = req.params.id;

  const existing = await prisma.card.findFirst({
    where: { id: cardId, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: parsed.data,
  });
  res.json(updated);
});

app.delete("/cards/:id", auth, async (req: AuthedRequest, res) => {
  const cardId = req.params.id;

  const existing = await prisma.card.findFirst({
    where: { id: cardId, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  await prisma.card.delete({ where: { id: cardId } });
  res.json({ ok: true });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
