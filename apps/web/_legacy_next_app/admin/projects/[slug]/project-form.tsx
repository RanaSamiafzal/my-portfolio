"use client";

import type { Project } from "@repo/content";
import { ImageUploadField } from "@/components/image-upload-field";
import { CmsForm, Field, ListEditor, LinesField, Section } from "../../cms-form";
import { saveProjectAction } from "../../cms-actions";

export function ProjectForm({ project }: { project: Project; isNew?: boolean }) {
  const links = project.links.length ? project.links : [{ label: "", href: "" }];

  return (
    <CmsForm action={saveProjectAction} className="mt-10 space-y-6">
      <Section title="Basics">
        <Field label="Slug" name="slug" defaultValue={project.slug} hint="url key, e.g. brandly" />
        <Field label="Name" name="name" defaultValue={project.name} />
        <Field label="Tagline" name="tagline" defaultValue={project.tagline} />
        <Field label="Summary" name="summary" defaultValue={project.summary} rows={4} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Period" name="period" defaultValue={project.period} />
          <Field label="Context" name="context" defaultValue={project.context} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mono-label">Status</span>
            <select
              name="status"
              defaultValue={project.status}
              className="mt-2 w-full rounded-xl border border-line bg-black/40 px-4 py-3 text-text outline-none focus:border-accent"
            >
              <option>Live</option>
              <option>In progress</option>
              <option>Shipped</option>
            </select>
          </label>
          <Field label="Sort order" name="sortOrder" type="number" defaultValue="0" />
        </div>
        <label className="flex items-center gap-3 font-mono text-xs text-muted">
          <input type="checkbox" name="featured" defaultChecked={project.featured} className="size-4 accent-[var(--color-accent)]" />
          Featured on home
        </label>
      </Section>

      <Section title="Screenshot">
        <ImageUploadField
          name="image"
          label="Project image"
          defaultValue={project.image ?? ""}
          folder="projects"
          previewFrame
          chromeUrl={project.imageUrl || project.slug || "preview"}
          hint="Upload → URL auto-fills → same browser frame as the site"
        />
        <Field
          label="Address bar text"
          name="imageUrl"
          defaultValue={project.imageUrl ?? ""}
          hint="Shown in the fake browser chrome (e.g. brandly.app)"
        />
      </Section>

      <Section title="Tags & stack">
        <LinesField label="Categories" name="categories" values={project.categories} hint="One per line (AI & SaaS, Full-stack…)" />
        <LinesField label="Tech (for Stack stats)" name="tech" values={project.tech} hint="One per line — powers /stack counts" rows={5} />
        <LinesField label="Stack chips" name="stack" values={project.stack} hint="One per line — shown on cards" rows={5} />
      </Section>

      <Section title="Links">
        <ListEditor
          name="link"
          items={links}
          blank={() => ({ label: "", href: "" })}
          addLabel="Add link"
          render={(l, i) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Label" name={`link_${i}_label`} defaultValue={l.label} placeholder="Live / GitHub" />
              <Field label="URL" name={`link_${i}_href`} defaultValue={l.href} placeholder="https://" />
            </div>
          )}
        />
      </Section>

      <Section title="Case study (optional)">
        <Field
          label="Case study JSON"
          name="caseStudy"
          defaultValue={project.caseStudy ? JSON.stringify(project.caseStudy, null, 2) : ""}
          rows={10}
          hint="Leave blank if none — advanced structure only"
        />
      </Section>
    </CmsForm>
  );
}
