"use client";

import { CmsForm, Field, ListEditor, Section } from "../cms-form";
import { saveFaqAction } from "../cms-actions";

type FaqItem = { q: string; a: string };

export function FaqForm({ items }: { items: FaqItem[] }) {
  return (
    <CmsForm action={saveFaqAction} className="mt-10 space-y-6">
      <Section title="Questions">
        <ListEditor
          name="faq"
          items={items}
          blank={() => ({ q: "", a: "" })}
          addLabel="Add question"
          render={(item, i) => (
            <div className="space-y-3">
              <Field label="Question" name={`faq_${i}_q`} defaultValue={item.q} />
              <Field label="Answer" name={`faq_${i}_a`} defaultValue={item.a} rows={4} />
            </div>
          )}
        />
      </Section>
    </CmsForm>
  );
}
