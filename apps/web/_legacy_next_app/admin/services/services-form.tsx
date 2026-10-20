"use client";

import type { SiteService } from "@repo/db";
import { CmsForm, Field, ListEditor, Section } from "../cms-form";
import { saveServicesAction } from "../cms-actions";

const blank = (): SiteService => ({ id: "", title: "", body: "", tags: [] });

export function ServicesForm({ services }: { services: SiteService[] }) {
  return (
    <CmsForm action={saveServicesAction} className="mt-10 space-y-6">
      <Section title="Hire-me cards">
        <ListEditor
          name="service"
          items={services}
          blank={blank}
          addLabel="Add service"
          render={(s, i) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ID" name={`service_${i}_id`} defaultValue={s.id} hint="01, 02…" />
                <Field label="Title" name={`service_${i}_title`} defaultValue={s.title} />
              </div>
              <Field label="Body" name={`service_${i}_body`} defaultValue={s.body} rows={3} />
              <Field
                label="Tags"
                name={`service_${i}_tags`}
                defaultValue={s.tags.join(", ")}
                hint="Comma or newline separated"
              />
            </div>
          )}
        />
      </Section>
    </CmsForm>
  );
}
