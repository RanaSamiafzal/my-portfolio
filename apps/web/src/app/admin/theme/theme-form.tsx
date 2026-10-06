"use client";

import type { HeroAssets, SiteTheme } from "@repo/db";
import { ImageUploadField } from "@/components/image-upload-field";
import { CmsForm, Field, Section } from "../cms-form";
import { saveThemeAction } from "../cms-actions";

export function ThemeForm({ theme, hero }: { theme: SiteTheme; hero: HeroAssets }) {
  return (
    <CmsForm action={saveThemeAction} className="mt-10 space-y-6">
      <Section title="Colors">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Accent" name="accent" type="color" defaultValue={theme.accent} />
          <Field label="Accent soft" name="accentSoft" type="color" defaultValue={theme.accentSoft} />
          <Field label="Cream / buttons" name="cream" type="color" defaultValue={theme.cream} />
          <Field label="Text" name="text" type="color" defaultValue={theme.text} />
          <Field label="Background" name="bg0" type="color" defaultValue={theme.bg0} />
        </div>
      </Section>
      <Section title="Hero images">
        <ImageUploadField name="desk" label="Hero desk" defaultValue={hero.desk} folder="hero" hint="Main desk photo" />
        <ImageUploadField name="mask" label="Hero mask" defaultValue={hero.mask} folder="hero" />
        <ImageUploadField name="matte" label="Hero matte" defaultValue={hero.matte} folder="hero" />
        <ImageUploadField name="portrait" label="Portrait" defaultValue={hero.portrait} folder="profile" aspect="square" />
      </Section>
    </CmsForm>
  );
}
