# Page snapshot

```yaml
- alert
- dialog:
  - heading "Build Error" [level=1]
  - paragraph: Failed to compile
  - text: Next.js (14.2.30) is outdated
  - link "(learn more)":
    - /url: https://nextjs.org/docs/messages/version-staleness
  - link "./lib/supabase/chat-support.ts":
    - text: ./lib/supabase/chat-support.ts
    - img
  - text: "Error: x You're importing a component that needs next/headers. That only works in a Server Component which is not supported in the pages/ directory. Read more:"
  - link "https://nextjs.org/docs/getting-started/":
    - /url: https://nextjs.org/docs/getting-started/
  - text: "| react-essentials#server-components | | ,-[/Users/notiseoton2/Desktop/SiteAris/lib/supabase/chat-support.ts:5:1] 5 | 6 | import { createClient } from '@/lib/supabase/client'; 7 | import { createServerComponentClient } from '@/lib/supabase/helpers'; 8 | import { cookies } from 'next/headers'; : ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 9 | import { v4 as uuidv4 } from 'uuid'; 10 | 11 | export type ChatMessage = { `----"
  - contentinfo:
    - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```