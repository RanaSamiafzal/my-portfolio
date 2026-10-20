import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { deleteMessage, markMessageRead } from "@repo/db";
import * as cms from "@/lib/cms-mutations";
import { getSession } from "@/lib/session";

function adminForm(mutate: (previous: cms.CmsState, form: FormData) => Promise<cms.CmsState>) {
  return defineAction({
    accept: "form",
    handler: async (form: FormData, context) => {
      if (context.request.headers.get("origin") !== context.url.origin) {
        throw new ActionError({ code: "FORBIDDEN", message: "Invalid request origin." });
      }
      const session = await getSession(context.cookies);
      if (!session?.isAdmin) throw new ActionError({ code: "UNAUTHORIZED", message: "Please sign in as admin." });
      return mutate({}, form);
    },
  });
}

export const server = {
  saveProject: adminForm(cms.saveProjectAction),
  saveProfile: adminForm(cms.saveProfileAction),
  saveExperience: adminForm(cms.saveExperienceAction),
  saveSkills: adminForm(cms.saveSkillsAction),
  saveFaq: adminForm(cms.saveFaqAction),
  saveServices: adminForm(cms.saveServicesAction),
  saveTheme: adminForm(cms.saveThemeAction),
  deleteProject: adminForm(async (_, form) => {
    const slug = z.string().regex(/^[a-z0-9-]+$/).parse(form.get("slug"));
    await cms.deleteProjectAction(slug);
    return { ok: true };
  }),
  updateMessage: adminForm(async (_, form) => {
    const id = z.coerce.number().int().positive().parse(form.get("id"));
    const operation = z.enum(["delete", "read", "unread"]).parse(form.get("operation"));
    if (operation === "delete") await deleteMessage(id);
    else await markMessageRead(id, operation === "read");
    return { ok: true };
  }),
};
