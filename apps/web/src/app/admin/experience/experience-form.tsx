"use client";

import type { Role } from "@repo/content";
import { CmsForm, Field, ListEditor, Section } from "../cms-form";
import { saveExperienceAction } from "../cms-actions";

const blank = (): Role => ({
  year: "",
  period: "",
  title: "",
  company: "",
  location: "",
  points: [],
  stack: [],
});

export function ExperienceForm({ roles }: { roles: Role[] }) {
  return (
    <CmsForm action={saveExperienceAction} className="mt-10 space-y-6">
      <Section title="Roles">
        <ListEditor
          name="role"
          items={roles}
          blank={blank}
          addLabel="Add role"
          render={(r, i) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title" name={`role_${i}_title`} defaultValue={r.title} />
                <Field label="Company" name={`role_${i}_company`} defaultValue={r.company} />
                <Field label="Year" name={`role_${i}_year`} defaultValue={r.year} placeholder="2026" />
                <Field label="Period" name={`role_${i}_period`} defaultValue={r.period} placeholder="Jun 2026 → Aug 2026" />
                <Field label="Location" name={`role_${i}_location`} defaultValue={r.location} />
              </div>
              <Field
                label="Bullet points"
                name={`role_${i}_points`}
                defaultValue={r.points.join("\n")}
                rows={4}
                hint="One point per line"
              />
              <Field
                label="Stack"
                name={`role_${i}_stack`}
                defaultValue={r.stack.join(", ")}
                hint="Comma or newline separated"
              />
            </div>
          )}
        />
      </Section>
    </CmsForm>
  );
}
