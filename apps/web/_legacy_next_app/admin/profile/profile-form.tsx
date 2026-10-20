"use client";

import type { SiteSettings } from "@repo/db";
import { ImageUploadField } from "@/components/image-upload-field";
import { CmsForm, Field, ListEditor, LinesField, Section } from "../cms-form";
import { saveProfileAction } from "../cms-actions";

type Profile = SiteSettings["profile"];

export function ProfileForm({ profile, ticker }: { profile: Profile; ticker: string[] }) {
  return (
    <CmsForm action={saveProfileAction} className="mt-10 space-y-6">
      <Section title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" defaultValue={profile.name} />
          <Field label="Short name" name="shortName" defaultValue={profile.shortName} />
          <Field label="Handle" name="handle" defaultValue={profile.handle} />
          <Field label="Role" name="role" defaultValue={profile.role} />
        </div>
        <Field label="Headline" name="headline" defaultValue={profile.headline} />
        <Field label="Intro" name="intro" defaultValue={profile.intro} rows={3} />
        <LinesField label="Rotating words" name="rotating" values={[...profile.rotating]} hint="One phrase per line (hero scramble)" rows={5} />
      </Section>

      <Section title="Contact & location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location" name="location" defaultValue={profile.location} />
          <Field label="Timezone" name="timezone" defaultValue={profile.timezone} />
          <Field label="Email" name="email" type="email" defaultValue={profile.email} />
          <Field label="Phone" name="phone" defaultValue={profile.phone} />
          <Field label="Phone link" name="phoneHref" defaultValue={profile.phoneHref} hint="tel:+92…" />
          <Field label="WhatsApp URL" name="whatsapp" defaultValue={profile.whatsapp} />
        </div>
        <Field label="Availability" name="availability" defaultValue={profile.availability} rows={2} />
      </Section>

      <Section title="Links & assets">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GitHub URL" name="github" defaultValue={profile.socials.github} />
          <Field label="GitHub username" name="githubUser" defaultValue={profile.githubUser} />
          <Field label="LinkedIn URL" name="linkedin" defaultValue={profile.socials.linkedin} />
          <Field label="CV path" name="cv" defaultValue={profile.cv} hint="/file.pdf in public/" />
        </div>
        <ImageUploadField
          name="portrait"
          label="Portrait"
          defaultValue={profile.portrait}
          folder="profile"
          aspect="square"
          hint="Upload or keep a /public path"
        />
      </Section>

      <Section title="Education">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Degree" name="degree" defaultValue={profile.education.degree} />
          <Field label="School" name="school" defaultValue={profile.education.school} />
          <Field label="Status" name="eduStatus" defaultValue={profile.education.status} />
        </div>
      </Section>

      <Section title="About paragraphs">
        <Field
          label="About"
          name="about"
          defaultValue={profile.about.join("\n\n")}
          rows={10}
          hint="Separate paragraphs with a blank line"
        />
      </Section>

      <Section title="Courses">
        <ListEditor
          name="course"
          items={[...profile.courses]}
          blank={() => ({ title: "", org: "", year: "" })}
          addLabel="Add course"
          render={(c, i) => (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Title" name={`course_${i}_title`} defaultValue={c.title} />
              <Field label="Org" name={`course_${i}_org`} defaultValue={c.org} />
              <Field label="Year" name={`course_${i}_year`} defaultValue={c.year} />
            </div>
          )}
        />
      </Section>

      <Section title="Ticker">
        <LinesField label="Ticker items" name="ticker" values={[...ticker]} rows={8} hint="One per line — scrolls in the top bar" />
      </Section>
    </CmsForm>
  );
}
