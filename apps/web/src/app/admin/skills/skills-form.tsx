"use client";

import type { SkillGroup } from "@repo/content";
import { CmsForm, Field, LinesField, ListEditor, Section } from "../cms-form";
import { saveSkillsAction } from "../cms-actions";

const blank = (): SkillGroup => ({ id: "", title: "", blurb: "", items: [] });

export function SkillsForm({ groups, marquee }: { groups: SkillGroup[]; marquee: string[] }) {
  return (
    <CmsForm action={saveSkillsAction} className="mt-10 space-y-6">
      <Section title="Skill groups">
        <ListEditor
          name="group"
          items={groups}
          blank={blank}
          addLabel="Add group"
          render={(g, i) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ID" name={`group_${i}_id`} defaultValue={g.id} hint="e.g. frontend" />
                <Field label="Title" name={`group_${i}_title`} defaultValue={g.title} />
              </div>
              <Field label="Blurb" name={`group_${i}_blurb`} defaultValue={g.blurb} rows={2} />
              <Field
                label="Skills"
                name={`group_${i}_items`}
                defaultValue={g.items.join(", ")}
                rows={3}
                hint="Comma or newline separated"
              />
            </div>
          )}
        />
      </Section>
      <Section title="Marquee">
        <LinesField label="Scrolling stack labels" name="marquee" values={marquee} rows={6} hint="One per line" />
      </Section>
    </CmsForm>
  );
}
