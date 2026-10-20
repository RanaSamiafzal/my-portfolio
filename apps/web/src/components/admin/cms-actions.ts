import { actions } from "astro:actions";
import type { CmsState } from "@/lib/cms-mutations";
export type { CmsState };

export async function saveProjectAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  try {
    const { data, error } = await actions.saveProject(formData);
    if (error) return { error: error.message };
    if (data.redirect) window.location.assign(data.redirect);
    return data;
  } catch {
    return { error: "Could not save. Check your connection and try again." };
  }
}

export async function saveProfileAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  try {
    const { data, error } = await actions.saveProfile(formData);
    if (error) return { error: error.message };
    if (data.redirect) window.location.assign(data.redirect);
    return data;
  } catch {
    return { error: "Could not save. Check your connection and try again." };
  }
}

export async function saveExperienceAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  try {
    const { data, error } = await actions.saveExperience(formData);
    if (error) return { error: error.message };
    if (data.redirect) window.location.assign(data.redirect);
    return data;
  } catch {
    return { error: "Could not save. Check your connection and try again." };
  }
}

export async function saveSkillsAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  try {
    const { data, error } = await actions.saveSkills(formData);
    if (error) return { error: error.message };
    if (data.redirect) window.location.assign(data.redirect);
    return data;
  } catch {
    return { error: "Could not save. Check your connection and try again." };
  }
}

export async function saveFaqAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  try {
    const { data, error } = await actions.saveFaq(formData);
    if (error) return { error: error.message };
    if (data.redirect) window.location.assign(data.redirect);
    return data;
  } catch {
    return { error: "Could not save. Check your connection and try again." };
  }
}

export async function saveServicesAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  try {
    const { data, error } = await actions.saveServices(formData);
    if (error) return { error: error.message };
    if (data.redirect) window.location.assign(data.redirect);
    return data;
  } catch {
    return { error: "Could not save. Check your connection and try again." };
  }
}

export async function saveThemeAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  try {
    const { data, error } = await actions.saveTheme(formData);
    if (error) return { error: error.message };
    if (data.redirect) window.location.assign(data.redirect);
    return data;
  } catch {
    return { error: "Could not save. Check your connection and try again." };
  }
}

