import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please add your name").max(120),
  email: z.email("That email doesn't look right").max(200),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  interest: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "A little more detail helps (10+ characters)").max(5000),
  // Honeypot: real people never fill this in.
  website: z.string().max(0).optional().or(z.literal("")),
});

export const hireSchema = z.object({
  name: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(3).max(200),
  brief: z.string().trim().min(10).max(5000),
  budget: z.string().trim().max(80).optional(),
  agent: z.string().trim().max(40).optional(),
});

export const guestbookSchema = z.object({
  body: z.string().trim().min(2, "Say a bit more").max(280, "Keep it under 280 characters"),
});
