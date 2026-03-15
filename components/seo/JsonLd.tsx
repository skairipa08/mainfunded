// Server component — renders a <script type="application/ld+json"> tag.
// Pass any schema object from lib/seo/schemas.ts.

interface Props {
  schema: Record<string, unknown> | Record<string, unknown>[]
}

export function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
